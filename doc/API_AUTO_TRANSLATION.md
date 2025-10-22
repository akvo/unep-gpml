# Auto-Translation API Documentation

## Overview

The UNEP GPML Digital Platform now supports **automatic translation** of resources using Google Translate API. When translations don't exist in the database, the system automatically translates content, caches it for future use, and returns it to the user—all in a single request.

**Key Benefits:**
- Zero frontend changes required
- Automatic caching of translations in database
- Efficient batch processing (single API call for multiple resources)
- Graceful degradation on errors
- Controlled rollout via feature flag

---

## GET /api/bulk-translations

Get translations for multiple resources in a specified language. When auto-translation is enabled and translations don't exist, the system will automatically translate the content using Google Translate.

### Request

**Method:** `GET`

**URL:** `/api/bulk-translations`

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `topics` | string | Yes | Comma-separated list of topic-type:id pairs | `policy:1,event:2,resource:3` |
| `language` | string | Yes | ISO 639-1 language code (2-3 characters) | `es`, `fr`, `zh` |
| `fields` | string | No | Comma-separated list of content fields to include in response (for filtering response only, see note below) | `title,summary,description` |

**Important Note on `fields` Parameter:**
- The `fields` parameter **only filters the response**, not the translation scope
- When auto-translation is triggered, **all translatable fields are translated and cached**, regardless of the `fields` parameter
- This ensures complete translations are cached for future requests
- See "Fields Parameter Behavior" section below for details

### Response

**Success (200 OK):**

```json
{
  "success?": true,
  "translations": [
    {
      "topic_type": "policy",
      "topic_id": 1,
      "language": "es",
      "content": {
        "title": "Política de Plástico",
        "abstract": "Resumen de la política...",
        "remarks": "Observaciones..."
      }
    },
    {
      "topic_type": "event",
      "topic_id": 2,
      "language": "es",
      "content": {
        "title": "Evento de Limpieza",
        "description": "Descripción del evento..."
      }
    }
  ]
}
```

**Error (500 Internal Server Error):**

```json
{
  "success?": false,
  "error": "Error message details"
}
```

### Behavior

#### With Auto-Translation Disabled (Default)

Returns only translations that exist in the database:

```bash
curl "https://globalplasticshub.org/api/bulk-translations?topics=policy:1,event:2&language=es"

# Response: Only returns translations found in database
# Missing translations are simply omitted from response
```

#### With Auto-Translation Enabled

Automatically translates missing content:

```bash
curl "https://globalplasticshub.org/api/bulk-translations?topics=policy:1,event:2&language=es"

# Response: Returns all translations
# - policy:1 from database (already exists)
# - event:2 auto-translated and cached (newly translated)
```

### Fields Parameter Behavior

**The `fields` parameter controls response filtering, NOT translation scope:**

#### Example: Request with `fields=title`

```bash
# Request: Only want title field in response
curl "https://globalplasticshub.org/api/bulk-translations?topics=policy:123&language=es&fields=title"
```

**Backend Processing:**
1. Check DB for **ALL translatable fields** for policy:123 in Spanish
2. If missing, translate **ALL fields**: title, abstract, remarks, info_docs
3. Save **ALL translated fields** to database
4. Return **ONLY the requested field** (title) in response

**Response:**
```json
{
  "success?": true,
  "translations": [
    {
      "topic_type": "policy",
      "topic_id": 123,
      "language": "es",
      "content": {
        "title": "Título de la Política"
      }
    }
  ]
}
```

**Note:** All fields are cached in database, but response is filtered to only include `title`

#### Subsequent Request with Different Fields

```bash
# Request 2: Now want abstract and remarks
curl "https://globalplasticshub.org/api/bulk-translations?topics=policy:123&language=es&fields=abstract,remarks"
```

**Response Time:** < 300ms (instant, from cache)

**Response:**
```json
{
  "success?": true,
  "translations": [
    {
      "topic_type": "policy",
      "topic_id": 123,
      "language": "es",
      "content": {
        "abstract": "Resumen de la política...",
        "remarks": "Observaciones adicionales..."
      }
    }
  ]
}
```

**Rationale:**
- **Cost Efficiency**: Translating all fields together is cheaper than multiple separate requests
- **Simplicity**: No need to track partial translations
- **Future Benefit**: Subsequent requests for other fields are instant (already cached)
- **Consistency**: Database state is predictable - complete translations only

### Source Language Detection

The system automatically detects the source language of each resource:

#### Example: Multi-Language Sources

```bash
# Resources with different source languages
# - policy:123 (source: English)
# - policy:456 (source: Spanish)
# - event:789 (source: French)

curl "https://globalplasticshub.org/api/bulk-translations?topics=policy:123,policy:456,event:789&language=es"
```

**Backend Processing:**
1. Fetch source data with language column
2. Filter same-language records (policy:456 is already in Spanish, skip translation)
3. Group by source language (English: [policy:123], French: [event:789])
4. Translate English texts → Spanish
5. Translate French texts → Spanish
6. Copy Spanish source content as-is (policy:456)
7. Combine all results

**Response:**
```json
{
  "success?": true,
  "translations": [
    {
      "topic_type": "policy",
      "topic_id": 123,
      "content": { "title": "..." }  // Translated: en→es
    },
    {
      "topic_type": "policy",
      "topic_id": 456,
      "content": { "title": "..." }  // Copied: es (no translation needed)
    },
    {
      "topic_type": "event",
      "topic_id": 789,
      "content": { "title": "..." }  // Translated: fr→es
    }
  ]
}
```

**Benefits:**
- Skips unnecessary translations when source language equals target language
- Provides correct source language to Google Translate for accurate translations
- Handles multilingual content repositories efficiently

### Performance

| Scenario | Response Time | Notes |
|----------|---------------|-------|
| Cache hit (from DB) | < 300ms | No translation needed |
| Single resource translation | < 2s | Including DB save |
| Batch of 10 resources | < 4s | Single API call to Google |
| Batch of 50 resources | < 10s | Multiple API calls |
| Error fallback | < 100ms | Returns DB results only |

### Error Handling

The system implements graceful degradation:

1. **Translation API Failure**: Returns existing translations from database, logs error
2. **Rate Limit (429)**: Retries with exponential backoff (max 3 attempts), falls back to DB on failure
3. **Missing Source Data**: Skips translation for missing resources, returns available translations
4. **Database Errors**: Returns error response with details

**Example Error Scenario:**

```bash
# Request translation for 3 resources
# - policy:1 exists in DB
# - policy:2 exists in source, but Google Translate API fails
# - policy:3 doesn't exist in source

curl "https://globalplasticshub.org/api/bulk-translations?topics=policy:1,policy:2,policy:3&language=es"
```

**Response:**
```json
{
  "success?": true,
  "translations": [
    {
      "topic_type": "policy",
      "topic_id": 1,
      "content": { "title": "..." }  // From DB cache
    }
  ]
}
```

**Result:** Returns policy:1 from cache, logs errors for policy:2 (API failure) and policy:3 (missing source)

---

## Translation Cache Invalidation

Translations are automatically invalidated when source content is updated or deleted.

### On Resource Update

When any resource field is updated, all translations for that resource are deleted:

```bash
# Update policy:123
PUT /api/detail/policy/123
{
  "title": "Updated Policy Title"
}

# Result: All translations for policy:123 deleted
# Next translation request will re-translate with updated source content
```

**Trade-off:** Deletes translations even if non-translatable fields changed (e.g., `geo_coverage`). This ensures no stale translations but may cause unnecessary re-translation.

**Future Optimization:** Smart field-level invalidation to only delete translations when translatable fields change.

### On Resource Deletion

When a resource is deleted, its translations are automatically cleaned up:

```bash
DELETE /api/detail/policy/123

# Result: Resource and all its translations deleted
```

---

## Translatable Fields by Resource Type

Each resource type has specific fields that are translatable:

| Resource Type | Translatable Fields |
|--------------|---------------------|
| **policy** | title, abstract, remarks, info_docs |
| **event** | title, description, remarks, info_docs |
| **resource** | title, summary, remarks, value_remarks, info_docs |
| **financing_resource** | title, summary, remarks, value_remarks, info_docs |
| **technical_resource** | title, summary, remarks, value_remarks, info_docs |
| **action_plan** | title, summary, remarks, value_remarks, info_docs |
| **data_catalog** | title, summary, remarks, value_remarks, info_docs |
| **technology** | name, remarks, info_docs |
| **initiative** | q2-q24, title, summary, info_docs (27 fields total) |
| **case_study** | title, description |
| **project** | title, description, summary |

---

## Supported Languages

The system supports all languages supported by Google Translate API. Common language codes:

| Code | Language | Code | Language |
|------|----------|------|----------|
| `en` | English | `es` | Spanish |
| `fr` | French | `de` | German |
| `zh` | Chinese | `ar` | Arabic |
| `hi` | Hindi | `pt` | Portuguese |
| `ru` | Russian | `ja` | Japanese |
| `ko` | Korean | `it` | Italian |

Full list: [Google Translate Supported Languages](https://cloud.google.com/translate/docs/languages)

---

## Examples

### Example 1: Detail Page Translation

Translate a single policy for display on detail page:

```bash
curl "https://globalplasticshub.org/api/bulk-translations?topics=policy:123&language=es&fields=title,abstract"
```

### Example 2: Resources List Translation

Translate multiple resources for browse/search results:

```bash
curl "https://globalplasticshub.org/api/bulk-translations?topics=policy:1,policy:2,event:3,resource:4,resource:5&language=fr&fields=title"
```

### Example 3: Mixed Resource Types

Translate resources of different types:

```bash
curl "https://globalplasticshub.org/api/bulk-translations?topics=policy:1,event:2,technology:3,case_study:4&language=zh"
```

### Example 4: Authenticated Request

For protected resources (if authentication is required in the future):

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://globalplasticshub.org/api/bulk-translations?topics=policy:123&language=es"
```

---

## Cost Estimation

Google Translate API pricing: $20 per 1 million characters

**Typical Request Costs:**

| Scenario | Characters | Cost | Notes |
|----------|-----------|------|-------|
| Single resource (3 fields) | ~300 chars | $0.006 | First translation |
| Single resource (cached) | 0 chars | $0 | From database |
| Batch of 10 resources | ~3,000 chars | $0.06 | First translation |
| Batch of 50 resources | ~15,000 chars | $0.30 | First translation |

**Monthly Cost Estimates:**

| Usage | Requests/Month | Cost/Month | Notes |
|-------|---------------|------------|-------|
| Light | 1,000 | ~$60 | Assuming 50% cache hit rate |
| Medium | 5,000 | ~$300 | Assuming 60% cache hit rate |
| Heavy | 10,000 | ~$600 | Assuming 70% cache hit rate |

**Note:** Actual costs depend on cache hit rate, content length, and usage patterns.

---

## Feature Flag

Auto-translation is controlled by the `AUTO_TRANSLATE_ENABLED` environment variable:

- **Disabled** (default): Returns only existing translations from database
- **Enabled**: Automatically translates missing content using Google Translate

**To enable:**
```bash
AUTO_TRANSLATE_ENABLED=true
```

**To disable:**
```bash
AUTO_TRANSLATE_ENABLED=false
# or simply omit the environment variable
```

---

## Limitations

1. **Translation Quality**: Google Translate is optimized for general content. Technical or domain-specific terms may not translate perfectly.
2. **Rate Limits**: Subject to Google Translate API rate limits (default: 300,000 chars/minute).
3. **Batch Size**: Limited to reasonable batch sizes to prevent timeouts (default max: 10 resources per auto-translate request).
4. **Source Language**: Each resource has one source language. Translations are generated from that source language to the target language.
5. **Cache Invalidation**: Updates to any resource field invalidate all translations (may be optimized in future).

---

## Support

For issues or questions:
- API Issues: Check [Swagger Documentation](https://globalplasticshub.org/api/docs/index.html)
- Translation Quality: Use the PUT endpoint to manually correct translations
- Rate Limits: Contact support to increase API quota
- General Questions: [GitHub Issues](https://github.com/akvo/unep-gpml/issues)
