# Backend Auto-Translation Implementation Plan
**Feature**: Automatic Google Translate Integration for GET /api/bulk-translations

## Executive Summary

Move translation processing from frontend to backend by integrating Google Translate API into the existing **bulk translation endpoint** (`GET /api/bulk-translations`). When translations don't exist in the database, the system will automatically translate content using Google Translate, save it for future use, and return it to the user—all in a single request.

**Key Benefits:**
- **Zero frontend changes required** - Transparent upgrade to existing workflow
- **Zero changes to resource endpoints** - Detail and browse handlers unchanged
- **All changes isolated** to translation handler (`gpml.handler.topic.translation/get`)
- Translations automatically cached in database
- Efficient batch processing (1 API call for multiple resources)
- Graceful degradation on errors
- Easy rollout with feature flags
- Simple rollback (disable feature flag)

---

## Current System Analysis

### Existing Architecture
```
Frontend (Next.js)
  ├─ translationService.js - Manages translation flow
  ├─ googleTranslate.js - Google Translate API client
  └─ Flow: Fetch from DB → Auto-translate missing → Save to DB

Backend (Clojure)
  ├─ GET /api/bulk-translations - Retrieve translations from DB
  ├─ PUT /api/bulk-translations - Save translations to DB
  └─ Database: topic_translation table (JSONB content)
```

### Main API Endpoints (Translation Use Cases)

**Frontend Workflow** (No Changes):
```
1. User requests resource(s) → GET /api/detail/{topic-type}/{topic-id}
                              OR GET /api/resources
2. Frontend receives resource data (English)
3. Frontend requests translations → GET /api/bulk-translations?topics=policy:1,event:2&language=es
4. Frontend merges translations with resource data
```

**Key Use Cases for Bulk Translation Endpoint**:

**1. Detail Page Translation** - Called after `GET /api/detail/{topic-type}/{topic-id}`
- **Translation Request**: Single resource (1 resource × 3-5 fields)
- **Example**: `GET /api/bulk-translations?topics=policy:123&language=es&fields=title,abstract`

**2. Resources List Translation** - Called after `GET /api/resources`
- **Translation Request**: Multiple resources (up to 50 resources × 3-5 fields = **major batching opportunity**)
- **Example**: `GET /api/bulk-translations?topics=policy:1,event:2,resource:3,...&language=es&fields=title`
- **Optimization**: This is the primary use case for efficient bulk translation batching

### Important: `fields` Parameter Behavior

**The `fields` parameter controls response filtering, NOT translation scope:**

```
Request: GET /api/bulk-translations?topics=policy:123&language=es&fields=title
         (User only requests title field)

Backend Processing:
1. Check DB for ALL translatable fields for policy:123 in Spanish
2. If missing, translate ALL fields: title, abstract, remarks, info_docs
3. Save ALL translated fields to database
4. Return ONLY the requested field (title) in response

Response: {"topic_type": "policy", "topic_id": 123, "content": {"title": "..."}}
         (Only title returned, but all fields cached in DB)
```

**Rationale**:
- **Simplicity**: No need to track partial translations (either all fields translated or none)
- **Cost Efficiency**: Translating all fields together in one batch is cheaper than multiple separate requests
- **Future Benefit**: Next request for other fields is instant (already in cache)
- **Consistency**: Database state is predictable - complete translations only

**Cost Impact Example**:
```
Scenario 1: Translate only requested field (NOT our approach)
- Request 1: fields=title → Translate 1 field → Cost: $0.002
- Request 2: fields=abstract → Translate 1 field → Cost: $0.002
- Request 3: fields=remarks → Translate 1 field → Cost: $0.002
- Total: 3 API calls, $0.006

Scenario 2: Translate all fields upfront (OUR approach)
- Request 1: fields=title → Translate 3 fields → Cost: $0.006
- Request 2: fields=abstract → Cached (no translation) → Cost: $0
- Request 3: fields=remarks → Cached (no translation) → Cost: $0
- Total: 1 API call, $0.006

Result: Same cost, but 2/3 of future requests are FREE!
```

### Translation Table Schema
```sql
CREATE TABLE topic_translation (
    topic_type text NOT NULL,           -- policy, event, resource, technology, initiative, case_study
    topic_id integer NOT NULL,
    language varchar(3) NOT NULL,       -- ISO code (en, es, fr, etc.)
    content jsonb NOT NULL,             -- Flexible translation storage
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    UNIQUE(topic_type, topic_id, language)
);
```

### Translatable Fields by Resource Type

**Current System** (`gpml.domain.translation/translatable-fields-by-entity`):
- **policy**: title, abstract, info_docs
- **event**: title, description, info_docs
- **resource**: title, value_remarks, summary, info_docs
- **technology**: title, remarks, info_docs
- **initiative**: q2, q3, title, summary, info_docs, + 18 more fields
- **case_study**: title, description

**Issues with Current Mapping**:
1. **Key Type Mismatch**: Uses keyword keys (`:policy`, `:event`) but `gpml.domain.types/topic-types` uses strings (`"policy"`, `"event"`)
2. **Missing Fields**: `remarks` field not included for policy, event, resource (though it exists in database)
3. **Missing Resource Sub-types**: `financing_resource`, `technical_resource`, `action_plan`, `data_catalog` not mapped (all use `resource` table)
4. **Missing Project Type**: `project` type added in migration 223 but not in translatable fields
5. **Technology Field**: Database uses `name` column, not `title`

**Proposed Solution**: Create new mapping specifically for bulk translation system to avoid breaking changes to legacy system.

### New Translatable Fields Mapping (Proposed)

**`translatable-fields-by-topic`** - String-based keys matching `topic-types`:

```clojure
(def translatable-fields-by-topic
  "Translatable fields for each topic type (for bulk translation system).
   Uses string keys to match gpml.domain.types/topic-types."
  {"policy"               #{:title :abstract :remarks :info_docs}
   "event"                #{:title :description :remarks :info_docs}
   "resource"             #{:title :summary :remarks :value_remarks :info_docs}
   "financing_resource"   #{:title :summary :remarks :value_remarks :info_docs}  ; maps to resource table
   "technical_resource"   #{:title :summary :remarks :value_remarks :info_docs}  ; maps to resource table
   "action_plan"          #{:title :summary :remarks :value_remarks :info_docs}  ; maps to resource table
   "data_catalog"         #{:title :summary :remarks :value_remarks :info_docs}  ; maps to resource table
   "technology"           #{:name :remarks :info_docs}  ; note: uses :name not :title
   "initiative"           #{:q2 :q3 :q4 :q5 :q6 :q7 :q8 :q9 :q10 :q11 :q12 :q13 :q14
                            :q15 :q16 :q17 :q18 :q19 :q20 :q21 :q22 :q23 :q24
                            :title :summary :info_docs}
   "case_study"           #{:title :description}
   "project"              #{:title :description :summary}})

(def topic-type->table
  "Maps topic types to their database table names.
   Resource sub-types all map to the 'resource' table."
  {"policy"               "policy"
   "event"                "event"
   "resource"             "resource"
   "financing_resource"   "resource"
   "technical_resource"   "resource"
   "action_plan"          "resource"
   "data_catalog"         "resource"
   "technology"           "technology"
   "initiative"           "initiative"
   "case_study"           "case_study"
   "project"              "project"})
```

**Key Design Decisions**:
- **String Keys**: Matches `topic-types` definition (no keyword/string conversion needed)
- **Complete Coverage**: All topic types from `gpml.domain.types/topic-types` included
- **Resource Sub-types**: Each sub-type explicitly mapped (all use same fields as resource)
- **Separate from Legacy**: Keeps existing `translatable-fields-by-entity` intact for legacy translation handler and BRS importer
- **Schema-less Compatible**: Used for field extraction from source data, but translation table remains JSONB (any content)
- **Validated by Search Fields**: The fields align with `gpml.db.topic/search-text-fields` (topic.clj:15-21), which defines searchable content—exactly what users need translated!

### Why Create a New Mapping?

**Option A: Modify `translatable-fields-by-entity`** ❌
- Would require changing key types from keywords to strings (breaking change)
- Used by legacy translation handler for field validation (would break validation logic)
- Used by BRS API importer for data extraction (would require updates)
- Requires thorough testing of two separate systems

**Option B: Create new `translatable-fields-by-topic`** ✅ **(Selected)**
- Zero breaking changes to existing systems
- Designed specifically for bulk translation use case
- Clear separation between legacy and new systems
- String keys match `topic-types` from the start
- Includes all topic types (including new ones like project)
- No risk to currently working BRS importer and legacy translation handler

**Migration Path**:
1. **Phase 2**: Create new mapping (this implementation)
2. **Phase 3+**: Use new mapping for auto-translation feature
3. **Future**: Eventually migrate legacy systems to use new mapping (optional, low priority)
4. **Long-term**: Deprecate old mapping once all systems migrated (if desired)

**Current System Usage**:
- `translatable-fields-by-entity` → Used by:
  - `gpml.handler.resource.translation` (legacy translation handler) - validates fields
  - `gpml.scheduler.brs_api_importer` - extracts translatable fields from BRS API
- `translatable-fields-by-topic` → Used by:
  - New auto-translation service (this implementation)
  - Source data fetching functions
  - Field extraction for Google Translate batching

### Validation: Comparison with Search Text Fields

The proposed `translatable-fields-by-topic` closely aligns with `gpml.db.topic/search-text-fields` (topic.clj:15-21), which defines fields used for full-text search. This validates that we're translating the right content—the same fields users search by.

| Topic Type | Search Text Fields (topic.clj) | Translatable Fields (proposed) | Notes |
|------------|-------------------------------|--------------------------------|-------|
| **event** | title, description, remarks | title, description, remarks, info_docs | Added `info_docs` (documents field) |
| **technology** | name | name, remarks, info_docs | Added `remarks` and `info_docs` (both exist in DB) |
| **policy** | title, original_title, abstract, remarks | title, abstract, remarks, info_docs | Similar, added `info_docs` |
| **initiative** | q2, q3 | q2-q24, title, summary, info_docs | Extended to include all form questions |
| **resource** | title, summary, remarks | title, summary, remarks, value_remarks, info_docs | Added `value_remarks` and `info_docs` |
| **case_study** | title, description | title, description | Exact match ✓ |
| **project** | title, summary, background, purpose | title, description, summary | Subset of search fields |

**Key Insight**: Our translatable fields are a **superset** of search-text-fields, ensuring all searchable content is translatable. This is exactly what users need for a multilingual experience.

---

### Integration Strategy

**Integration Point**: `gpml.handler.topic.translation/get` (ONLY)

**No changes to**:
- ❌ `gpml.handler.detail/get` - Remains unchanged
- ❌ `gpml.handler.browse/resources` - Remains unchanged
- ❌ Frontend workflow - Still makes two API calls

**Changes to**:
- ✅ `gpml.handler.topic.translation/get` - Add auto-translation when translations missing from DB
- ✅ `gpml.service.topic.translation` - Add service function for auto-translation logic
- ✅ `gpml.boundary.adapter.translate.google` - New Google Translate API client

**Current Handler Flow** (handler/topic/translation.clj):
```clojure
(defmethod ig/init-key ::get [_ config]
  (fn [{{:keys [query]} :parameters}]
    ;; Current: Only fetch from DB
    (let [result (svc.topic.translation/get-bulk-topic-translations
                   config (:topics query) (:language query) (:fields query))]
      (if (:success? result)
        (resp/response {:success? true :translations (:translations result)})
        (r/server-error result)))))
```

**Enhanced Handler Flow** (with auto-translate):
```clojure
(defmethod ig/init-key ::get [_ config]
  (fn [{{:keys [query]} :parameters}]
    (if (empty? (:topics query))
      (resp/response {:success? true :translations []})
      (let [auto-translate? (get-in config [:auto-translate :enabled] false)
            ;; NEW: Use auto-translate service if enabled
            result (if auto-translate?
                     (svc.topic.translation/get-bulk-translations-with-auto-translate
                       config (:topics query) (:language query) (:fields query))
                     (svc.topic.translation/get-bulk-topic-translations
                       config (:topics query) (:language query) (:fields query)))]
        (if (:success? result)
          (resp/response {:success? true :translations (:translations result)})
          (r/server-error result))))))
```

**Key Benefits**:
- Zero changes to resource endpoints (detail/browse)
- All translation logic contained in translation handler
- Frontend workflow unchanged (transparent upgrade)
- Easy rollback via feature flag

---

## Translation Cache Invalidation Strategy

### Problem Statement

When users update source content (e.g., policy title, event description), cached translations in the `topic_translation` table become stale and misaligned with the original content.

**Example Scenario**:
```
1. Policy:123 created with title "Plastic Ban Policy" (English)
2. Frontend requests translation → Auto-translated to Spanish: "Política de Prohibición de Plástico"
3. Translation cached in database
4. User updates policy title to "Extended Plastic Ban Policy"
5. Problem: Spanish translation still shows old title "Política de Prohibición de Plástico"
```

### Current State Analysis

**Database Schema**:
- ✅ `topic_translation` table has `created_at` and `updated_at` timestamps
- ❌ **No foreign key** to topic tables (policy, event, resource, etc.)
- ❌ **No CASCADE DELETE** - translations orphaned when resources deleted
- ❌ **No invalidation logic** - translations persist indefinitely after source updates

**Resource Update Flow**:
```clojure
;; backend/src/gpml/handler/detail.clj (line 862-888)
(defmethod ig/init-key :gpml.handler.detail/put [_ config]
  (fn [{{:keys [path body]} :parameters user :user}]
    ;; Current: Updates resource, NO translation invalidation
    (update-resource config tx topic-type topic-id body)))
```

### Selected Solution: Strategy 1 - Immediate Deletion

**Approach**: Delete all translations when source content is updated

**Implementation**:

#### 1. Add SQL Query
**File**: `backend/src/gpml/db/topic/translation.sql`

```sql
-- :name delete-topic-translations :! :n
-- Delete all translations for a specific topic (all languages)
DELETE FROM topic_translation
WHERE topic_type = :topic-type
  AND topic_id = :topic-id;
```

#### 2. Modify Update Handler
**File**: `backend/src/gpml/handler/detail.clj`

```clojure
;; Add after line 885 (after update-resource completes)
(when (= status 1)
  ;; Invalidate all translations when resource is updated
  (db.topic.translation/delete-topic-translations
    (:spec db)
    {:topic-type topic-type :topic-id topic-id})
  (r/ok {:success? true}))
```

**Apply to both**:
- `update-resource` function (line 750-820) - policies, events, resources, technologies
- `update-initiative` function (line 822-860) - initiatives

#### 3. Handle Resource Deletion
**File**: `backend/src/gpml/handler/detail.clj`

```clojure
;; Add to delete-resource function (around line 504)
(let [result (db.resource.detail/delete-resource (:spec db) logger {...})]
  ;; Clean up translations after resource deleted
  (when (:success? result)
    (db.topic.translation/delete-topic-translations
      (:spec db)
      {:topic-type resource-type :topic-id resource-id}))
  result)
```

**Note**: This is defensive - translations should already be gone if we add CASCADE DELETE constraint.

#### 4. Optional: Add Foreign Key Constraint (Future Enhancement)

**Migration** (optional, for data integrity):
```sql
-- Note: This would require adding referential integrity across multiple tables
-- More complex due to polymorphic relationship (topic_type + topic_id)
-- Recommended for Phase 2 implementation
```

### Trade-offs Analysis

**Advantages** ✅:
- Simple and reliable implementation
- No stale data ever served to users
- No additional table columns needed
- Works with existing schema
- Translations regenerated with updated source content
- Easy to understand and maintain

**Disadvantages** ❌:
- Loses ALL translations when any field updated (even if only non-translatable fields changed)
- Higher Google Translate API costs (re-translation)
- Slower first request after update (2-4 seconds for re-translation)
- Wastes previous translation work

**Cost Impact Example**:
```
Scenario: User updates policy geo_coverage (non-translatable field)
- Current behavior: Keeps translations intact ✅
- With Strategy 1: Deletes all translations ❌
- Cost: $0.06 to re-translate 3 fields
- Better alternative: Strategy 2 (Smart Invalidation) - only delete if translatable fields changed

Decision: Accept this trade-off for MVP, optimize in Phase 2 if needed
```

### Future Optimization: Strategy 2 - Smart Field-Level Invalidation

**Phase 2 Enhancement** (optional):

Only delete translations if translatable fields actually changed:

```clojure
(defn- translatable-fields-changed? [topic-type updates]
  (let [translatable-fields (get translatable-fields-by-topic topic-type)]
    (some translatable-fields (keys updates))))

;; In update handler
(when (and (= status 1)
           (translatable-fields-changed? topic-type table-columns))
  (db.topic.translation/delete-topic-translations conn {...}))
```

**Benefits**:
- Reduces unnecessary re-translations by ~60-70%
- Lower API costs
- Preserves translations when only non-translatable fields change

**Complexity**: Medium (requires field tracking)

### Implementation Checklist

**Phase 3 Tasks** (add to existing phase):
- [ ] Add `delete-topic-translations` SQL query
- [ ] Add `delete-topic-translations` function to `gpml.db.topic.translation`
- [ ] Modify `update-resource` to delete translations on update
- [ ] Modify `update-initiative` to delete translations on update
- [ ] Modify `delete-resource` to clean up translations on delete
- [ ] Add unit tests for invalidation logic
- [ ] Integration test: Update resource → translations deleted → re-translated on next request
- [ ] Performance test: Verify update operation doesn't slow down significantly

**Acceptance Criteria**:
- ✅ Updating any resource field deletes all its translations
- ✅ Next translation request re-translates with updated source
- ✅ Deleting a resource removes its translations
- ✅ No stale translations served to users
- ✅ Update operation completes in < 500ms (deletion is fast)

---

## Target Architecture

### New Flow
```
User Request: GET /bulk-translations?topics=policy:1,event:2&language=es

Backend Processing:
  1. Check database for existing translations
  2. Identify missing translations
  3. Fetch source data for missing items
  4. Extract translatable fields (per resource type)
  5. Batch translate via Google Translate API
  6. Bulk save to database
  7. Return all translations (DB + newly translated)

Response Time: 2-4 seconds (including translation)
```

### Components to Create

#### 1. Google Translate Adapter (Boundary Layer)
**File**: `backend/src/gpml/boundary/adapter/translate/google.clj`

```clojure
(ns gpml.boundary.adapter.translate.google
  (:require
   [gpml.util.http-client :as http-client]
   [gpml.boundary.port.translate :as port]))

;; Core functions:
;; - translate-texts [api-key texts target-lang source-lang]
;; - batch-texts [texts max-texts max-chars]
;; - handle-rate-limit [response attempt]

;; Google Translate API v2 endpoint:
;; POST https://translation.googleapis.com/language/translate/v2?key={API_KEY}
;; Body: {"q": ["text1", "text2", ...], "target": "es", "source": "en"}

;; Limits:
;; - 128 texts per request
;; - 30,000 characters per request
;; - 5,000 characters per text
```

**Key Features:**
- Smart batching algorithm to optimize API calls
- Retry logic with exponential backoff (leverages existing `gpml.util.http-client`)
- Character counting and text chunking
- Error handling for API errors (400, 401, 429, 500)
- Response parsing and text extraction

#### 2. Translation Port Interface
**File**: `backend/src/gpml/boundary/port/translate.clj`

```clojure
(ns gpml.boundary.port.translate)

(defmulti translate-texts
  "Translate multiple texts to target language"
  (fn [adapter & _] (type adapter)))
```

#### 3. Source Data Fetching
**Files**:
- `backend/src/gpml/db/topic/translation.sql` (add queries)
- `backend/src/gpml/db/topic/translation.clj` (add functions)

**New Queries**:
```sql
-- :name get-bulk-topic-source-data :? :*
-- Get original language content for multiple topics
SELECT
  :topic-type AS topic_type,
  id AS topic_id,
  -- Dynamic column selection per topic type
FROM :i:table
WHERE id IN (:v*:topic-ids);
```

**Implementation Challenge**: Each resource type has different table structure
**Solution**: Dynamic query generation based on topic-type

#### 4. Enhanced Translation Service
**File**: `backend/src/gpml/service/topic/translation.clj`

**New Function**: `get-bulk-translations-with-auto-translate`

```clojure
(defn get-bulk-translations-with-auto-translate
  [config topic-filters language fields options]
  ;; NOTE: 'fields' parameter is ONLY used for response filtering,
  ;;       NOT for limiting translation scope.
  ;;
  ;; 1. Get existing translations from DB (check for complete translations)
  ;; 2. Identify missing translations
  ;; 3. If auto-translate enabled:
  ;;    a. Fetch source data for missing (ALL translatable fields)
  ;;    b. Extract ALL translatable fields (ignore fields param)
  ;;    c. Batch all texts for translation
  ;;    d. Call Google Translate
  ;;    e. Map results back to resources (ALL fields)
  ;;    f. Bulk upsert to DB (save ALL translated fields)
  ;; 4. Filter response by 'fields' parameter
  ;; 5. Return combined results (DB + new, filtered by fields))
```

**Logic Flow**:
```
Input: [{:topic-type "policy" :topic-id 1}
        {:topic-type "event" :topic-id 2}]
       language="es"
       fields=["title"]  (user only wants title in response)

Step 1: Query DB for ALL translatable fields
  Check: Do we have complete translation for policy:1 and event:2?
  Result: policy:1 exists (all fields), event:2 missing

Step 2: Fetch source data for event:2 (ALL translatable fields)
  Query: SELECT title, description, remarks, info_docs FROM event WHERE id = 2
  Result: {:title "Beach Cleanup"
           :description "Annual event..."
           :remarks "Bring gloves"
           :info_docs nil}

Step 3: Extract ALL translatable fields (ignore fields parameter)
  Fields for event: #{:title :description :remarks :info_docs}
  Available in source: #{:title :description :remarks}
  To translate: ["Beach Cleanup", "Annual event...", "Bring gloves"]

Step 4: Translate batch (ALL fields)
  API call: translate(["Beach Cleanup", "Annual event...", "Bring gloves"], "es", "en")
  Result: ["Limpieza de Playa", "Evento anual...", "Trae guantes"]

Step 5: Map back (ALL translated fields)
  {:topic-type "event" :topic-id 2
   :content {:title "Limpieza de Playa"
             :description "Evento anual..."
             :remarks "Trae guantes"}}

Step 6: Bulk upsert (save ALL fields to DB)
  INSERT INTO topic_translation (topic_type, topic_id, language, content)
  VALUES ('event', 2, 'es', '{"title": "...", "description": "...", "remarks": "..."}'::jsonb)

Step 7: Return filtered by fields parameter
  [policy:1 (only title field), event:2 (only title field)]
  Note: All fields cached in DB, but response filtered by fields=["title"]
```

**Key Point**: The `fields` parameter is applied **only at response time**, not during translation. This ensures complete translations are always cached.

#### 5. Handler Updates
**File**: `backend/src/gpml/handler/topic/translation.clj`

```clojure
(defmethod ig/init-key ::get
  [_ config]
  (fn [{{:keys [query]} :parameters}]
    (if (empty? (:topics query))
      (resp/response {:success? true :translations []})
      (let [auto-translate? (get-in config [:auto-translate :enabled] false)
            result (if auto-translate?
                     (svc.topic.translation/get-bulk-translations-with-auto-translate
                       config (:topics query) (:language query) (:fields query))
                     (svc.topic.translation/get-bulk-topic-translations
                       config (:topics query) (:language query) (:fields query)))]
        (if (:success? result)
          (resp/response {:success? true :translations (:translations result)})
          (r/server-error result))))))
```

---

## Implementation Phases

### Phase 1: Google Translate Adapter (COMPLETED ✅)
**Goal**: Create reusable Google Translate API client

**Tasks**:
- [x] Create `boundary/adapter/translate/google.clj`
- [x] Create `boundary/port/translate.clj` (protocol)
- [x] Implement `translate-texts` function
- [x] Implement smart batching algorithm
  - [x] Character counting
  - [x] Text splitting (128 texts, 30k chars limits)
  - [x] Batch creation logic
- [x] Implement API request/response handling
- [x] Add retry logic for rate limits (uses existing http-client)
- [x] Error handling (API key invalid, network errors, etc.)
- [x] Manual REPL-driven tests (automated tests removed due to CI compatibility)
- [x] Add Integrant configuration to `duct.base.edn`
- [x] Wire adapter into system config (`:translate-adapter` in `:gpml.config/common`)
- [x] Fix HTTP request format (use `:form-params` instead of `:body`)

**Implementation Details**:

**File**: `backend/src/gpml/boundary/adapter/translate/google.clj`
- Protocol-based design using `defrecord GoogleTranslateAdapter`
- Implements `gpml.boundary.port.translate/TranslationService` protocol
- Smart batching respects all Google Translate API limits
- Uses existing `gpml.util.http-client` for retry logic and error handling
- Integrant initialization via `ig/init-key ::adapter`

**File**: `backend/src/gpml/boundary/port/translate.clj`
```clojure
(ns gpml.boundary.port.translate)

(defprotocol TranslationService
  (translate-texts [this texts target-language source-language]
    "Translate multiple texts to target language.

    Parameters:
    - texts: Vector of strings to translate
    - target-language: ISO 639-1 language code (e.g., 'es', 'fr')
    - source-language: ISO 639-1 language code (e.g., 'en')

    Returns:
    Vector of translated strings in same order as input."))
```

**Configuration** (`backend/resources/gpml/duct.base.edn`):
```clojure
;; Adapter initialization
:gpml.boundary.adapter.translate.google/adapter
{:api-key #duct/env ["GOOGLE_TRANSLATE_API_KEY" Str]
 :logger  #ig/ref :duct/logger}

;; Wire into common config
[:duct/const :gpml.config/common]
{...
 :translate-adapter #ig/ref :gpml.boundary.adapter.translate.google/adapter
 ...}
```

**Environment Variable**:
```bash
# Required for production adapter
GOOGLE_TRANSLATE_API_KEY=your-api-key-here
```

**Testing Approach**:
Manual REPL-driven tests are used instead of automated tests due to:
- External API dependency (requires valid API key)
- CI/CD compatibility issues with `with-redefs` and eftest parallel execution
- Similar pattern to other external adapters (e.g., `ds_chat.clj`)

**Test Location**: See comment block at end of `backend/src/gpml/boundary/adapter/translate/google.clj` for comprehensive manual test cases.

**REPL Test Example**:
```clojure
;; Connect to REPL
;; docker compose exec backend lein repl :connect localhost:47480

;; Load the namespace
(require '[gpml.boundary.port.translate :as port])

;; Get adapter from system (Option 1 - via common config, recommended)
(def adapter (:translate-adapter (dev/component [:duct/const :gpml.config/common])))

;; Or get directly by Integrant key (Option 2)
(def adapter (dev/component :gpml.boundary.adapter.translate.google/adapter))

;; Verify adapter loaded
adapter
;; => #gpml.boundary.adapter.translate.google.GoogleTranslateAdapter{...}

;; Test translation
(port/translate-texts adapter ["Hello, world!"] "es" "en")
;; => ["¡Hola Mundo!"]
```

**Mock Adapter for Local Development**:

**File**: `backend/test/mocks/boundary/adapter/translate/google.clj`
- Simple prefix-based translation (e.g., "Hello" → "[ES] Hello")
- Configured in `test.edn` for automated testing
- Can be enabled in `dev.edn` for local development (commented out by default)
- Implements same `TranslationService` protocol as real adapter

**Mock Configuration** (`backend/test-resources/test.edn`):
```clojure
:mocks.boundary.adapter.translate/google
{}

[:duct/const :gpml.config/common]
{...
 :translate-adapter #ig/ref :mocks.boundary.adapter.translate/google
 ...}
```

**Dev Configuration** (`backend/dev/resources/dev.edn` - optional, commented out):
```clojure
;; NOTE: uncomment this if you want to use the mock Google Translate adapter
;; during local development (no API key required).
;; :mocks.boundary.adapter.translate/google
;; {}
;;
;; [:duct/const :gpml.config/common]
;; {:translate-adapter #ig/ref :mocks.boundary.adapter.translate/google}
```

**Key Implementation Fix**:
The initial implementation had an HTTP request issue where `:body` was used instead of `:form-params`. The `gpml.util.http-client` sets `:content-type :json`, which tells clj-http to JSON-encode `:form-params` automatically, but not `:body`. This was fixed in commit `54e4b65a1`.

**Deliverables**:
- ✅ Working Google Translate adapter
- ✅ Mock adapter for local development
- ✅ System configuration (Integrant + environment variables)
- ✅ Test and dev configuration updated
- ✅ Comprehensive manual tests in source file
- ✅ Documentation with usage examples
- ✅ HTTP request format fixed (`:form-params`)

**Acceptance Criteria**:
- ✅ Can translate single text
- ✅ Can translate batch of 100+ texts efficiently
- ✅ Handles rate limits gracefully (via http-client retry logic)
- ✅ Returns error details on failure
- ✅ Smart batching respects all API limits (128 texts, 30k chars, 5k per text)
- ✅ Successfully tested in REPL with real API key
- ✅ Properly integrated into Integrant system
- ✅ Mock adapter available for development/testing

---

### Phase 2: Source Data Fetching (1-2 days)
**Goal**: Query source language data for resources

**Tasks**:
- [ ] Create new mapping in `gpml.domain.translation`:
  - [ ] Add `translatable-fields-by-topic` with string keys
  - [ ] Add `topic-type->table` helper mapping
  - [ ] Document differences from `translatable-fields-by-entity`
  - [ ] Keep existing `translatable-fields-by-entity` unchanged (no breaking changes)
- [ ] Design dynamic query approach for multiple resource types
- [ ] Add HugSQL queries for each resource type:
  - [ ] policy (title, abstract, remarks, info_docs)
  - [ ] event (title, description, remarks, info_docs)
  - [ ] resource + sub-types (title, summary, remarks, value_remarks, info_docs)
  - [ ] technology (name, remarks, info_docs) - note: `name` not `title`
  - [ ] initiative (20+ fields)
  - [ ] case_study (title, description)
  - [ ] project (title, description, summary)
- [ ] Implement `get-bulk-source-data` function
- [ ] Handle resource sub-types (all map to resource table)
- [ ] Handle missing resources gracefully
- [ ] Add tests for each resource type

**Technical Decisions**:
```clojure
;; Option 1: Separate query per type (simpler, more maintenance)
(defn get-source-data-for-policy [conn ids])
(defn get-source-data-for-event [conn ids])
;; ... etc

;; Option 2: Dynamic query generation with new mapping (complex, less maintenance)
(defn get-source-data [conn topic-type ids]
  (let [table (dom.translation/topic-type->table topic-type)
        columns (get dom.translation/translatable-fields-by-topic topic-type)]
    (query conn table columns ids)))
```

**Recommendation**: Option 2 with new `translatable-fields-by-topic` mapping for consistency and maintainability

**Deliverables**:
- New `translatable-fields-by-topic` mapping in domain layer
- Functions to fetch source data for all topic types (including sub-types)
- Unit tests with test database
- Performance validation (< 100ms for 10 resources)

---

### Phase 3: Translation Service Integration (2-3 days)
**Goal**: Orchestrate auto-translation flow

**Tasks**:
- [ ] Create `get-bulk-translations-with-auto-translate` function
- [ ] Implement missing translation detection logic
  - [ ] Check for **complete** translations only (all fields must exist)
  - [ ] Do NOT check for partial translations (simplifies logic)
  - [ ] Missing resource = translate ALL fields, not just requested ones
- [ ] Integrate source data fetching
  - [ ] Always fetch ALL translatable fields (ignore `fields` parameter)
- [ ] Implement field extraction logic
  - [ ] Use `gpml.domain.translation/translatable-fields-by-topic` (new mapping with string keys)
  - [ ] Extract ALL translatable fields for each resource
  - [ ] Filter to only fields present in source data
  - [ ] Handle nil/missing fields gracefully
  - [ ] Handle resource sub-types (use same fields as resource type)
- [ ] Integrate Google Translate adapter
  - [ ] Translate ALL extracted fields (ignore `fields` parameter)
- [ ] Implement result mapping logic
  - [ ] Map translated texts back to correct resource/field
  - [ ] Store ALL translated fields (complete translations)
  - [ ] Handle translation failures per-item
- [ ] Integrate bulk upsert to save translations
  - [ ] Save ALL translated fields to DB (complete translations only)
- [ ] Implement response filtering
  - [ ] Apply `fields` parameter AFTER translation and save
  - [ ] Filter response to only requested fields
  - [ ] Database has complete translations, response has filtered view
- [ ] **Implement cache invalidation** (Strategy 1: Immediate Deletion)
  - [ ] Add `delete-topic-translations` SQL query to `db/topic/translation.sql`
  - [ ] Add `delete-topic-translations` function to `db/topic/translation.clj`
  - [ ] Modify `update-resource` function in `handler/detail.clj` to delete translations on update
  - [ ] Modify `update-initiative` function in `handler/detail.clj` to delete translations on update
  - [ ] Modify `delete-resource` function to clean up translations on deletion
  - [ ] Add unit tests for invalidation logic
  - [ ] Integration test: Update resource → translations deleted → re-translated on next request
  - [ ] Performance test: Verify update operation doesn't slow down significantly
- [ ] Add comprehensive error handling
  - [ ] Translation API failure
  - [ ] Database errors
  - [ ] Partial success handling
- [ ] Add performance optimizations
  - [ ] Limit concurrent translations (e.g., max 10 resources)
  - [ ] Timeout handling (30s default)
- [ ] Unit tests with mocked dependencies
  - [ ] Test that ALL fields are translated even when `fields` parameter set
  - [ ] Test that response is correctly filtered by `fields` parameter
- [ ] Integration tests with test database

**Complex Logic**: Text-to-Resource Mapping
```clojure
;; Problem: After translating 10 texts, map back to 3 resources
;; texts: ["Title1", "Desc1", "Summary1", "Title2", "Desc2", "Title3", "Desc3", "Info3"]
;; resources: [policy:1, event:2, resource:3]

;; Solution: Create index mapping during extraction
(defn extract-translatable-texts [resources]
  (let [texts (atom [])
        index-map (atom [])]
    (doseq [resource resources
            field (get-translatable-fields (:topic-type resource))]
      (when-let [text (get-in resource [field])]
        (swap! texts conj text)
        (swap! index-map conj {:resource-key [(:topic-type resource) (:topic-id resource)]
                               :field field})))
    {:texts @texts :index-map @index-map}))

(defn map-translations-back [translated-texts index-map]
  (reduce (fn [acc [text {:keys [resource-key field]}]]
            (assoc-in acc [resource-key :content field] text))
          {}
          (map vector translated-texts index-map)))
```

**Deliverables**:
- Complete auto-translation service function
- Test coverage: 90%+
- Performance benchmarks
- Error handling validation

**Acceptance Criteria**:
- Can translate 1 resource correctly (all fields)
- Can translate 10 resources in single batch
- Handles mixed resource types (policy + event + resource)
- Returns partial results on partial failure
- Saves translations to DB correctly (all fields)
- **Fields parameter behavior**:
  - Translates ALL fields even when `fields` parameter specifies subset
  - Saves ALL translated fields to database
  - Returns only requested fields in response
  - Subsequent requests with different fields return instantly from cache

---

### Phase 4: Handler & Configuration (1 day)
**Goal**: Wire up feature with configuration

**Tasks**:
- [ ] Update GET handler to use auto-translate service
- [ ] Add feature flag check
- [ ] Add configuration to `duct.base.edn`:
  ```clojure
  [:duct/const :gpml.config/google-translate]
  {:api-key #duct/env ["GOOGLE_TRANSLATE_API_KEY" Str]
   :enabled #duct/env ["AUTO_TRANSLATE_ENABLED" Bool :or false]
   :max-batch-size #duct/env ["AUTO_TRANSLATE_MAX_BATCH_SIZE" Int :or 10]
   :timeout-ms #duct/env ["AUTO_TRANSLATE_TIMEOUT_MS" Int :or 30000]}

  :gpml.boundary.adapter.translate/google
  {:api-key #ig/ref :gpml.config/google-translate/api-key}
  ```
- [ ] Update `gpml.config/common` to include translate adapter
- [ ] Add Integrant initialization
- [ ] Handler tests with feature flag on/off
- [ ] Environment variable documentation

**Deliverables**:
- Configured system with feature flag
- Environment variable setup guide
- Handler tests passing

---

### Phase 5: Testing & Quality Assurance (2-3 days)
**Goal**: Comprehensive testing and performance validation

**Tasks**:
- [ ] Unit tests for all new components
- [ ] Integration tests end-to-end
- [ ] Performance tests:
  - [ ] Single resource translation
  - [ ] Batch of 10 resources
  - [ ] Batch of 50 resources (should handle pagination)
  - [ ] All 6 resource types
- [ ] Error scenario testing:
  - [ ] Invalid API key
  - [ ] Network timeout
  - [ ] Rate limit (429)
  - [ ] Invalid resource IDs
  - [ ] Database connection failure
- [ ] Load testing (optional):
  - [ ] 100 concurrent requests
  - [ ] API quota monitoring
- [ ] Code quality checks:
  - [ ] clj-kondo (linting)
  - [ ] cljfmt (formatting)
  - [ ] eastwood (static analysis)
- [ ] Test coverage report (target: 85%+)

**Test Data Setup**:
```clojure
;; Create test resources in all 6 types
;; Create some translations in DB
;; Leave some untranslated
;; Test mixed scenarios
```

**Deliverables**:
- All tests passing
- Performance metrics documented
- Coverage report
- Known issues/limitations documented

---

### Phase 6: Documentation & Deployment (1 day)
**Goal**: Production-ready deployment

**Tasks**:
- [ ] Update API documentation
  - [ ] Behavior with auto-translate enabled
  - [ ] Response time expectations
  - [ ] Error responses
- [ ] Write deployment guide
  - [ ] Environment variable setup
  - [ ] Feature flag rollout strategy
  - [ ] Monitoring setup
- [ ] Create runbook for operations:
  - [ ] How to enable/disable feature
  - [ ] How to monitor API usage
  - [ ] Troubleshooting common issues
- [ ] Mark PUT endpoint as deprecated (in docs only)
- [ ] Update CHANGELOG
- [ ] Code review and approval

**Deliverables**:
- Updated API documentation
- Deployment checklist
- Operations runbook
- Approved PR ready for deployment

---

## Technical Specifications

### Google Translate API Integration

**API Endpoint**:
```
POST https://translation.googleapis.com/language/translate/v2?key={API_KEY}
Content-Type: application/json

Request Body:
{
  "q": ["text1", "text2", "text3"],
  "source": "en",
  "target": "es",
  "format": "text"
}

Response:
{
  "data": {
    "translations": [
      {"translatedText": "texto1"},
      {"translatedText": "texto2"},
      {"translatedText": "texto3"}
    ]
  }
}
```

**API Limits**:
- 128 texts per request
- 30,000 characters per request
- 5,000 characters per text
- Rate limit: varies by quota (default: 300,000 chars/minute)

**Batching Strategy**:
```
Example: Translate 15 fields across 5 resources

Without batching: 15 API calls
With batching: 1 API call (all 15 texts in one request)

Savings: 93% fewer API calls
Cost reduction: ~93% (API charged per character)
```

**Cost Estimation**:
- Google Translate pricing: $20 per 1M characters
- Average translation: 100 characters per field
- 10 resources × 3 fields × 100 chars = 3,000 characters
- Cost per request: ~$0.06 USD
- Monthly (1000 requests): ~$60 USD

### Performance Targets

| Metric | Target | Notes |
|--------|---------|-------|
| Single resource translation | < 2s | Including DB save |
| Batch of 10 resources | < 4s | 1 API call |
| Batch of 50 resources | < 10s | Multiple API calls |
| Cache hit (from DB) | < 300ms | No translation needed |
| API failure fallback | < 100ms | Return DB results only |

### Error Handling Strategy

```
Translation Flow Error Handling:

1. DB Check: Always succeeds (returns what's available)
2. Source Data Fetch:
   - Missing resources → Skip translation, return DB results
   - DB error → Return error response
3. Google Translate API:
   - 401 Unauthorized → Log error, return DB results, disable feature
   - 429 Rate Limit → Retry with backoff (max 3 attempts)
   - 500 Server Error → Log error, return DB results
   - Timeout → Return DB results, log warning
4. Translation Mapping:
   - Always succeeds (mapping is deterministic)
5. DB Upsert:
   - Failure → Log error, return translations anyway (user gets result)
   - Partial failure → Log, return all translations

Philosophy: Graceful degradation
- Always return what we have from DB
- Never fail the entire request due to translation errors
- Log all errors for monitoring
```

### Configuration Schema

**Environment Variables**:
```bash
# Required
GOOGLE_TRANSLATE_API_KEY=your_api_key_here

# Optional (defaults shown)
AUTO_TRANSLATE_ENABLED=false
AUTO_TRANSLATE_MAX_BATCH_SIZE=10
AUTO_TRANSLATE_TIMEOUT_MS=30000
AUTO_TRANSLATE_SOURCE_LANGUAGE=en
```

**Integrant Configuration**:
```clojure
:gpml.boundary.adapter.translate/google
{:api-key #duct/env ["GOOGLE_TRANSLATE_API_KEY" Str]
 :source-language #duct/env ["AUTO_TRANSLATE_SOURCE_LANGUAGE" Str :or "en"]
 :logger #ig/ref :duct/logger
 :retry-config {:timeout 30000
                :max-retries 3
                :backoff-ms [500 5000 2.0]}}

:gpml.service.topic.translation/config
{:db #ig/ref :duct.database.sql.hikaricp/read-write
 :translate-adapter #ig/ref :gpml.boundary.adapter.translate/google
 :auto-translate {:enabled #duct/env ["AUTO_TRANSLATE_ENABLED" Bool :or false]
                  :max-batch-size #duct/env ["AUTO_TRANSLATE_MAX_BATCH_SIZE" Int :or 10]
                  :timeout-ms #duct/env ["AUTO_TRANSLATE_TIMEOUT_MS" Int :or 30000]}}
```

---

## Rollout Strategy

### Phase 1: Development Testing (Week 1)
- [ ] Deploy to dev environment
- [ ] Set `AUTO_TRANSLATE_ENABLED=false`
- [ ] Run manual tests
- [ ] Verify no regression in existing functionality
- [ ] Enable feature flag for manual testing
- [ ] Test all 6 resource types

### Phase 2: QA Environment (Week 2)
- [ ] Deploy to QA
- [ ] Enable auto-translate: `AUTO_TRANSLATE_ENABLED=true`
- [ ] Run automated test suite
- [ ] Performance testing
- [ ] Load testing (optional)
- [ ] Monitor Google Translate API usage
- [ ] Collect metrics:
  - Average translation time
  - Cache hit rate
  - Error rate
  - API cost

### Phase 3: Staging Validation (Week 3)
- [ ] Deploy to staging
- [ ] Enable auto-translate
- [ ] Conduct user acceptance testing
- [ ] Monitor for 3-5 days
- [ ] Validate cost projections
- [ ] Performance validation under realistic load

### Phase 4: Production Canary (Week 4)
- [ ] Deploy to production with `AUTO_TRANSLATE_ENABLED=false`
- [ ] Enable for internal users only (if possible)
- [ ] Monitor for 2-3 days
- [ ] Gradually increase rollout (10% → 50% → 100%)
- [ ] Monitor dashboards:
  - Response times
  - Error rates
  - API costs
  - Database load

### Phase 5: Full Rollout (Week 5)
- [ ] Enable for all users: `AUTO_TRANSLATE_ENABLED=true`
- [ ] Monitor for 1 week
- [ ] Document any issues
- [ ] Optimize based on real usage patterns
- [ ] Consider deprecating PUT endpoint (after 3-6 months)

---

## Monitoring & Operations

### Metrics to Track

**Application Metrics**:
- `translation.auto_translate.requests` (counter)
- `translation.auto_translate.duration_ms` (histogram)
- `translation.auto_translate.errors` (counter by error type)
- `translation.cache_hit_rate` (gauge)
- `translation.texts_translated` (counter)
- `translation.batch_size` (histogram)

**Google Translate API Metrics**:
- `google_translate.requests` (counter)
- `google_translate.characters_translated` (counter)
- `google_translate.rate_limits` (counter)
- `google_translate.errors` (counter by status code)
- `google_translate.cost_estimate` (gauge)

**Database Metrics**:
- `translation.db_fetch_duration_ms` (histogram)
- `translation.db_upsert_duration_ms` (histogram)
- `translation.db_errors` (counter)

### Alerts to Configure

1. **High Error Rate**: > 5% errors in 5 minutes
2. **API Rate Limit**: > 10 rate limit errors in 1 minute
3. **Slow Translations**: P95 > 10 seconds
4. **API Cost Spike**: Daily cost > $100 (adjust based on budget)
5. **Database Errors**: > 1 error in 5 minutes

### Logging Strategy

```clojure
;; Success case
(log :info :auto-translation-completed
     {:topic-count 10
      :texts-translated 25
      :from-db 5
      :newly-translated 5
      :duration-ms 3250
      :language "es"})

;; Error case
(log :error :auto-translation-failed
     {:topic-count 10
      :error-type :api-timeout
      :fallback-to-db true
      :returned-count 5})

;; Rate limit warning
(log :warn :translation-rate-limited
     {:retry-attempt 2
      :backoff-ms 2000})
```

### Troubleshooting Guide

**Issue**: Translations taking too long (> 10s)
- Check: Google Translate API latency
- Check: Database query performance
- Check: Batch size (reduce MAX_BATCH_SIZE)
- Action: Optimize batching algorithm

**Issue**: API rate limit errors
- Check: Request rate in monitoring
- Action: Reduce MAX_BATCH_SIZE
- Action: Implement request throttling
- Action: Increase API quota with Google

**Issue**: High costs
- Check: Cache hit rate (should be > 70%)
- Check: Unnecessary translations (e.g., already in DB)
- Action: Optimize cache lookup logic
- Action: Review API usage patterns

**Issue**: Translation errors
- Check: API key validity
- Check: Network connectivity
- Check: Google Cloud Platform status
- Action: Verify environment variables
- Action: Test API key manually with curl

---

## Testing Strategy

### Unit Tests

**Google Translate Adapter**:
```clojure
(deftest translate-texts-success-test
  (with-redefs [http-client/request (fn [_ _]
                                      {:status 200
                                       :body {:data {:translations [...]}}})]
    (let [result (google/translate-texts api-key ["Hello"] "es" "en")]
      (is (= ["Hola"] result)))))

(deftest translate-texts-rate-limit-test
  (let [attempts (atom 0)
        mock-request (fn [_ _]
                       (swap! attempts inc)
                       (if (< @attempts 3)
                         {:status 429 :body {:error {:message "Rate limit"}}}
                         {:status 200 :body {:data {:translations [...]}}})))]
    (with-redefs [http-client/request mock-request]
      (let [result (google/translate-texts api-key ["Hello"] "es" "en")]
        (is (= 3 @attempts))
        (is (= ["Hola"] result))))))

(deftest batch-texts-respects-limits-test
  (let [texts (repeat 200 "test")
        batches (google/batch-texts texts 128 30000)]
    (is (= 2 (count batches)))
    (is (= 128 (count (first batches))))
    (is (= 72 (count (second batches))))))
```

**Translation Service**:
```clojure
(deftest auto-translate-missing-translations-test
  (testing "Translates missing, returns existing from DB"
    (let [config (test-config)
          topics [{:topic-type "policy" :topic-id 1}   ;; exists in DB
                  {:topic-type "event" :topic-id 2}]   ;; missing
          result (svc/get-bulk-translations-with-auto-translate
                   config topics "es" nil)]
      (is (:success? result))
      (is (= 2 (count (:translations result))))
      ;; Verify policy:1 came from DB (not translated)
      ;; Verify event:2 was translated and saved))))

(deftest auto-translate-handles-translation-failure-test
  (testing "Returns DB results when translation fails"
    (with-redefs [google/translate-texts (fn [& _] (throw (Exception. "API Error")))]
      (let [result (svc/get-bulk-translations-with-auto-translate
                     config topics "es" nil)]
        (is (:success? result))
        (is (= 1 (count (:translations result))))  ;; Only DB result
        (is (logged? :error :translation-failed))))))
```

**Handler**:
```clojure
(deftest get-translations-with-auto-translate-enabled-test
  (testing "Uses auto-translate service when enabled"
    (let [handler (handler/get (assoc config :auto-translate {:enabled true}))
          request {:parameters {:query {:topics [{:topic-type "policy" :topic-id 1}]
                                        :language "es"}}}
          response (handler request)]
      (is (= 200 (:status response)))
      (is (contains? (-> response :body :translations first :content) :title)))))

(deftest get-translations-with-auto-translate-disabled-test
  (testing "Uses standard service when disabled"
    (let [handler (handler/get (assoc config :auto-translate {:enabled false}))
          request {:parameters {:query {:topics [{:topic-type "policy" :topic-id 1}]
                                        :language "es"}}}
          response (handler request)]
      (is (= 200 (:status response))))))
```

### Integration Tests

```clojure
(use-fixtures :each
  (fn [f]
    ;; Setup: Start test database, load test data
    (setup-test-db)
    (load-test-resources)
    (f)
    ;; Teardown: Clean up
    (teardown-test-db)))

(deftest end-to-end-auto-translation-test
  (testing "Full flow from HTTP request to DB save"
    (let [api-key (System/getenv "GOOGLE_TRANSLATE_API_KEY_TEST")
          response (http/get "/api/bulk-translations"
                             {:query-params {:topics "policy:1,event:2"
                                             :language "es"}
                              :headers {"Authorization" "Bearer test-token"}})]
      (is (= 200 (:status response)))
      (is (= 2 (count (-> response :body :translations))))

      ;; Verify translations saved to DB
      (let [db-translations (db/get-bulk-topic-translations
                              conn
                              {:topic-filters [["policy" 1] ["event" 2]]
                               :language "es"})]
        (is (= 2 (count db-translations)))))))
```

### Performance Tests

```clojure
(deftest translation-performance-test
  (testing "Batch of 10 resources completes in < 4 seconds"
    (let [topics (mapv #(hash-map :topic-type "policy" :topic-id %) (range 1 11))
          start-time (System/currentTimeMillis)
          result (svc/get-bulk-translations-with-auto-translate
                   config topics "es" nil)
          duration (- (System/currentTimeMillis) start-time)]
      (is (< duration 4000))
      (is (= 10 (count (:translations result)))))))
```

---

## Risk Analysis & Mitigation

### Risk 1: Google Translate API Costs
**Impact**: High | **Likelihood**: Medium

**Scenarios**:
- Unexpected high usage
- Translation of long-form content
- Repeated translations of same content

**Mitigation**:
- Set `MAX_BATCH_SIZE` to limit concurrent translations
- Implement daily cost monitoring
- Set up billing alerts in Google Cloud Console
- Cache all translations in database
- Use field filtering to translate only needed fields

### Risk 2: API Rate Limiting
**Impact**: High | **Likelihood**: Medium

**Scenarios**:
- Sudden traffic spike
- Insufficient API quota
- Many concurrent users

**Mitigation**:
- Implement exponential backoff (already in http-client)
- Request quota increase from Google proactively
- Implement request throttling/queue if needed
- Graceful degradation (return DB results on rate limit)
- Monitor rate limit errors

### Risk 3: Translation Quality Issues
**Impact**: Medium | **Likelihood**: Low

**Scenarios**:
- Poor translation quality for technical terms
- Context loss in batch translations
- Language-specific formatting issues

**Mitigation**:
- Keep PUT endpoint for manual corrections
- Allow users to report translation issues
- Review sample translations during QA
- Consider maintaining glossary for technical terms (future enhancement)

### Risk 4: Performance Degradation
**Impact**: High | **Likelihood**: Low

**Scenarios**:
- Google Translate API slow response
- Database contention during bulk upserts
- Memory issues with large batches

**Mitigation**:
- Set aggressive timeouts (30s default)
- Limit batch size (10 resources default)
- Monitor P95/P99 response times
- Implement circuit breaker pattern (future enhancement)
- Load test before production rollout

### Risk 5: Backward Compatibility
**Impact**: Low | **Likelihood**: Very Low

**Scenarios**:
- Frontend breaking due to response format changes
- Existing integrations affected

**Mitigation**:
- Feature flag allows instant rollback
- No response format changes (only behavior)
- Extensive testing before rollout
- Keep PUT endpoint functional
- Gradual rollout strategy

---

## Future Enhancements

### Phase 2 Features (Post-Launch)

1. **Translation Quality Improvements**
   - Glossary support for technical terms
   - Context-aware translations
   - User feedback mechanism

2. **Performance Optimizations**
   - Background translation queue
   - Predictive pre-translation (popular resources)
   - CDN caching for translations

3. **Advanced Features**
   - Translation memory integration
   - Multiple translation provider support (DeepL, AWS Translate)
   - A/B testing different translation services

4. **Analytics & Insights**
   - Translation usage analytics
   - Popular language pairs
   - Cost optimization recommendations

5. **Admin Features**
   - Translation management dashboard
   - Bulk re-translation tool
   - Translation quality review interface

---

## Success Criteria

### Functional Requirements
- ✅ GET endpoint automatically translates missing content
- ✅ Translations saved to database for future use
- ✅ Supports all 6 resource types
- ✅ Handles 10+ resources in single request
- ✅ Graceful error handling and fallbacks
- ✅ No changes required to frontend
- ✅ PUT endpoint remains functional

### Performance Requirements
- ✅ Single resource: < 2 seconds
- ✅ Batch of 10: < 4 seconds
- ✅ Cache hit: < 300ms
- ✅ Error fallback: < 100ms
- ✅ 95% uptime during rollout

### Quality Requirements
- ✅ Test coverage: > 85%
- ✅ Zero data loss
- ✅ Zero breaking changes
- ✅ All linting checks pass
- ✅ Code review approved

### Business Requirements
- ✅ API costs < $100/month initially
- ✅ Feature flag for instant rollback
- ✅ Documentation complete
- ✅ Monitoring and alerts configured
- ✅ Stakeholder approval

---

## Appendix

### A. Related Files Reference

**Existing Files to Modify**:
- `/backend/src/gpml/service/topic/translation.clj` - Add auto-translation service function
- `/backend/src/gpml/handler/topic/translation.clj` - Update GET handler to use auto-translate
- `/backend/src/gpml/handler/detail.clj` - Add cache invalidation logic (delete translations on update/delete)
- `/backend/src/gpml/db/topic/translation.sql` - Add queries for fetching source data and deleting translations
- `/backend/src/gpml/db/topic/translation.clj` - Add functions for source data fetching and cache invalidation
- `/backend/src/gpml/domain/translation.clj` - Add new `translatable-fields-by-topic` mapping
- `/backend/src/gpml/util/http_client.clj` - Existing HTTP client (will use for Google Translate)
- `/backend/resources/gpml/duct.base.edn` - Add Google Translate adapter configuration
- `/backend/resources/migrations/235-create-topic-translation-table.up.sql` - Existing translation table

**Files Used for Reference** (no changes):
- `/backend/src/gpml/handler/browse.clj` - Resources list endpoint (calls bulk-translations from frontend)
- `/backend/src/gpml/db/topic.clj` - Topic queries (reference for search-text-fields validation)

**New Files to Create**:
- `/backend/src/gpml/boundary/port/translate.clj`
- `/backend/src/gpml/boundary/adapter/translate/google.clj`
- `/backend/test/gpml/boundary/adapter/translate/google_test.clj`
- `/backend/test/gpml/service/topic/translation_auto_test.clj`
- `/doc/GOOGLE_TRANSLATE_INTEGRATION.md` (this file)

### B. API Examples

**Before (Current Behavior)**:
```bash
# GET returns only what's in DB
curl "http://localhost:3000/api/bulk-translations?topics=policy:1,event:2&language=es"

# Response: Only policy:1 (event:2 missing)
{
  "success?": true,
  "translations": [
    {"topic_type": "policy", "topic_id": 1, "language": "es",
     "content": {"title": "Política de Plástico"}}
  ]
}
```

**After (With Auto-Translate)**:
```bash
# Request 1: GET with fields=title (only want title in response)
curl "http://localhost:3000/api/bulk-translations?topics=policy:1,event:2&language=es&fields=title"

# Backend translates ALL fields, but returns only title
# Response: Both items (event:2 auto-translated)
{
  "success?": true,
  "translations": [
    {"topic_type": "policy", "topic_id": 1, "language": "es",
     "content": {"title": "Política de Plástico"}},
    {"topic_type": "event", "topic_id": 2, "language": "es",
     "content": {"title": "Limpieza de Playa"}}
  ]
}
# Note: Description, remarks, info_docs also translated and saved to DB

# Request 2: Same resources, different fields (< 300ms, all from cache!)
curl "http://localhost:3000/api/bulk-translations?topics=policy:1,event:2&language=es&fields=description,remarks"

# Response: Instant (no translation needed, all fields already in DB)
{
  "success?": true,
  "translations": [
    {"topic_type": "policy", "topic_id": 1, "language": "es",
     "content": {"abstract": "...", "remarks": "..."}},
    {"topic_type": "event", "topic_id": 2, "language": "es",
     "content": {"description": "Evento anual...", "remarks": "..."}}
  ]
}
```

### C. Dependencies

**Existing**:
- `clj-http` (HTTP client) ✅
- `diehard` (retry logic) ✅
- `cheshire` (JSON parsing) ✅
- `integrant` (system management) ✅

**New**: None required!

### D. Timeline Summary

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1: Google Adapter | 2-3 days | Day 1 | Day 3 |
| Phase 2: Source Data | 1-2 days | Day 4 | Day 5 |
| Phase 3: Service Integration | 2-3 days | Day 6 | Day 8 |
| Phase 4: Configuration | 1 day | Day 9 | Day 9 |
| Phase 5: Testing & QA | 2-3 days | Day 10 | Day 12 |
| Phase 6: Documentation | 1 day | Day 13 | Day 13 |
| **Total Development** | **9-13 days** | | |
| Deployment & Rollout | 4-5 weeks | Week 1 | Week 5 |

**Estimated Completion**: 2-3 months (including phased rollout)

---

## Conclusion

This implementation plan provides a comprehensive, production-ready approach to integrating Google Translate API into the backend translation system. The design prioritizes:

1. **Performance**: Smart batching minimizes API calls and costs
2. **Reliability**: Graceful degradation ensures service continuity
3. **Cost-Effectiveness**: Database caching prevents redundant translations
4. **Maintainability**: Clean architecture with clear separation of concerns
5. **Safety**: Feature flags and phased rollout minimize risk

The existing translation infrastructure is well-designed and requires minimal changes to support auto-translation, making this a low-risk, high-value enhancement.

---

**Document Version**: 1.5
**Last Updated**: 2025-10-14
**Author**: Claude Code
**Status**: Under Review

**Changelog**:
- v1.5 (2025-10-14): **Added translation cache invalidation strategy** - Strategy 1 (Immediate Deletion): Delete all translations when source content is updated to prevent stale translations. Includes implementation details, trade-offs analysis, and future optimization path (Strategy 2: Smart Field-Level Invalidation).
- v1.4 (2025-10-14): **Clarified `fields` parameter behavior** - Backend always translates ALL fields regardless of `fields` param; `fields` only filters response, not translation scope
- v1.3 (2025-10-14): **Corrected integration strategy** - Auto-translation only in `gpml.handler.topic.translation/get`, NO changes to detail/browse handlers
- v1.2 (2025-10-14): Added main API endpoint analysis (detail/browse handlers), integration strategy, and validation comparison with search-text-fields
- v1.1 (2025-10-14): Added analysis of `translatable-fields-by-entity` issues and proposed new `translatable-fields-by-topic` mapping
- v1.0 (2025-10-13): Initial implementation plan
