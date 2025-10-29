# Implementation Plan: Admin-Only DELETE /bulk-translations Endpoint

**Date**: 2025-10-29
**Status**: Planning
**Branch**: feature/translation-schema-alignment

## Overview

Add a DELETE endpoint to `/api/bulk-translations` with admin-only access that supports three deletion patterns:
1. **Delete specific topics**: `DELETE ?topics=policy:123,event:456` (no confirmation needed)
2. **Delete all topics of a type**: `DELETE ?topic-type=policy&confirm=true` (requires confirmation)
3. **Delete ALL translations**: `DELETE ?confirm=true` (requires confirmation)

## User Requirements

✅ **Delete scope**: Support both specific topics AND topic-type-only patterns
✅ **Language scope**: Always delete all languages (simpler, matches existing functions)
✅ **Response format**: Detailed breakdown with counts by topic type
✅ **Safety mechanism**: Require `confirm=true` for dangerous operations (delete by type or delete all)

## Implementation Checklist

### Phase 1: Database Layer

#### 1.1 Add SQL Queries
**File**: `backend/src/gpml/db/topic/translation.sql`

- [ ] Add query for delete by topic-type only:
```sql
-- :name delete-topic-translations-by-type :! :n
-- Delete all translations for a specific topic type (all topics, all languages)
-- Admin only - use with caution
DELETE FROM topic_translation
WHERE topic_type = :topic-type;
```

- [ ] Consider if delete-all query is needed (may execute directly via JDBC)

**Existing queries to reuse**:
- `delete-bulk-topic-translations` (line 18-21) - for specific topics
- `delete-topic-translations` (line 23-28) - for single topic

#### 1.2 Update Database Namespace
**File**: `backend/src/gpml/db/topic/translation.clj`

- [ ] Add to `declare` statement (around line 6):
```clojure
(declare get-bulk-topic-translations
         upsert-bulk-topic-translations
         delete-bulk-topic-translations
         delete-topic-translations
         delete-topic-translations-by-type  ;; <-- ADD THIS
         get-policy-source-data
         ;; ... rest of declarations
         )
```

### Phase 2: Service Layer

**File**: `backend/src/gpml/service/topic/translation.clj`

#### 2.1 Add Service Function for Delete by Type
- [ ] Implement `delete-topic-translations-by-type`:
```clojure
(defn delete-topic-translations-by-type
  "Deletes all translations for a specific topic type (all topics, all languages).
   Admin only - use with caution.

   Parameters:
   - config: Configuration map with :db key
   - topic-type: Topic type string (e.g., 'policy', 'event')

   Returns:
   {:success? true :deleted-count N}
   OR
   {:success? false :reason :error-key :error-details {...}}"
  [config topic-type]
  (try
    (let [conn (:spec (:db config))
          result (db.topic.translation/delete-topic-translations-by-type
                   conn
                   {:topic-type topic-type})]
      {:success? true :deleted-count result})
    (catch Exception e
      (failure {:reason :unexpected-error
                :error-details {:message (.getMessage e)}}))))
```

#### 2.2 Add Service Function for Delete All
- [ ] Implement `delete-all-topic-translations`:
```clojure
(defn delete-all-topic-translations
  "Deletes ALL topic translations from the database.
   DANGEROUS OPERATION - Admin only.

   Parameters:
   - config: Configuration map with :db key

   Returns:
   {:success? true :deleted-count N :by-type {topic-type count}}
   OR
   {:success? false :reason :error-key :error-details {...}}"
  [config]
  (try
    (let [conn (:spec (:db config))
          ;; First, get counts by type for detailed response
          count-query "SELECT topic_type, COUNT(*) as count
                       FROM topic_translation
                       GROUP BY topic_type"
          counts (jdbc/query conn [count-query])
          by-type (into {} (map (fn [row] [(:topic_type row) (:count row)]) counts))
          total-count (reduce + 0 (vals by-type))

          ;; Then delete all
          delete-query "DELETE FROM topic_translation"
          result (jdbc/execute! conn [delete-query])]
      {:success? true
       :deleted-count total-count
       :by-type by-type})
    (catch Exception e
      (failure {:reason :unexpected-error
                :error-details {:message (.getMessage e)}}))))
```

**Existing service functions to reuse**:
- `delete-bulk-topic-translations` (line 80-93) - for specific topics
- `delete-topic-translations` (line 95-115) - for single topic

### Phase 3: Handler Layer

**File**: `backend/src/gpml/handler/topic/translation.clj`

#### 3.1 Add Query Parameter Schema
- [ ] Add after `get-params` definition (after line 56):
```clojure
(def ^:private delete-params
  [:map
   [:topics {:description "Comma-separated pairs of topic-type:id (e.g. 'policy:1,event:2'). If provided, deletes only these specific topics."
             :example "policy:1,event:2"
             :swagger {:type "string"
                       :collectionFormat "csv"
                       :allowEmptyValue true}
             :optional true}
    [:maybe
     [:vector
      {:decode/string
       (fn [s]
         (if (or (nil? s) (empty? s))
           nil
           (->> (str/split s #",")
                (map #(str/split % #":"))
                (mapv (fn [[topic-type topic-id]]
                        {:topic-type topic-type
                         :topic-id (Integer/parseInt topic-id)})))))}
      [:map
       [:topic-type string?]
       [:topic-id int?]]]]]
   [:topic-type {:description "Topic type (e.g. 'policy', 'event'). If provided without topics param, deletes ALL translations of this type. Requires confirm=true."
                 :example "policy"
                 :swagger {:type "string"
                           :allowEmptyValue true}
                 :optional true}
    [:maybe [:string {:min 1}]]]
   [:confirm {:description "Confirmation flag required for dangerous operations (delete by type or delete all). Must be 'true'."
              :example "true"
              :swagger {:type "boolean"
                        :allowEmptyValue true}
              :optional true}
    [:maybe
     [:boolean
      {:decode/string
       (fn [s]
         (case (str/lower-case (str s))
           "true" true
           "false" false
           nil))}]]]])
```

#### 3.2 Add Integrant Initialization for Schema
- [ ] Add after line 62:
```clojure
(defmethod ig/init-key ::delete-params [_ _]
  delete-params)
```

#### 3.3 Implement DELETE Handler
- [ ] Add after the `::upsert` handler (after line 89):
```clojure
(defmethod ig/init-key ::delete
  [_ config]
  (fn [{{:keys [query]} :parameters user :user}]
    (if-not user
      (r/forbidden {:message "Authentication required"})
      (let [topics (:topics query)
            topic-type (:topic-type query)
            confirm? (:confirm query)

            ;; Determine deletion strategy
            result (cond
                     ;; Strategy 1: Delete specific topics (no confirmation needed)
                     (and topics (seq topics))
                     (svc.topic.translation/delete-bulk-topic-translations config topics)

                     ;; Strategy 2: Delete all of a specific type (requires confirmation)
                     (and topic-type (not (empty? topic-type)))
                     (if (true? confirm?)
                       (svc.topic.translation/delete-topic-translations-by-type config topic-type)
                       (r/bad-request {:success? false
                                       :reason :confirmation-required
                                       :message "Deleting all translations of a type requires confirm=true parameter"}))

                     ;; Strategy 3: Delete ALL translations (requires confirmation)
                     :else
                     (if (true? confirm?)
                       (svc.topic.translation/delete-all-topic-translations config)
                       (r/bad-request {:success? false
                                       :reason :confirmation-required
                                       :message "Deleting all translations requires confirm=true parameter"})))]

        ;; Handle result (may be error response from confirmation check)
        (if (map? result)
          (if (:success? result)
            (resp/response {:success? true
                            :deleted-count (:deleted-count result)
                            :by-type (:by-type result)})
            (if (= (:reason result) :confirmation-required)
              result  ;; Already a bad-request response
              (r/server-error result)))
          result))))  ;; Already a formatted response
```

**Note**: For strategies 1 and 2, we'll need to enhance the service functions to return `:by-type` breakdown.

### Phase 4: Route Configuration

**File**: `backend/resources/gpml/duct.base.edn`

#### 4.1 Add DELETE Method to Route
- [ ] Find `/bulk-translations` route (around line 508-520)
- [ ] Add `:delete` key after `:put`:
```clojure
["/bulk-translations"
 {:get {:summary    "Get bulk topic translations"
        :swagger    {:tags ["get bulk translations"]}
        :parameters {:query #ig/ref :gpml.handler.topic.translation/get-params}
        :handler    #ig/ref :gpml.handler.topic.translation/get}
  :put {:middleware [#ig/ref :gpml.auth/auth-middleware
                     #ig/ref :gpml.auth/auth-required]
        :summary    "Create or edit bulk topic translations"
        :swagger    {:tags     ["create bulk translations"
                                "edit bulk translations"]
                     :security [{:id_token []}]}
        :parameters {:body #ig/ref :gpml.handler.topic.translation/upsert-params}
        :handler    #ig/ref :gpml.handler.topic.translation/upsert}
  :delete {:middleware [#ig/ref :gpml.auth/auth-middleware
                        #ig/ref :gpml.auth/auth-required
                        #ig/ref :gpml.auth/admin-auth-required]  ;; <-- Admin only!
           :summary    "Delete bulk topic translations (Admin only)"
           :swagger    {:tags     ["delete bulk translations"]
                        :security [{:id_token []}]}
           :parameters {:query #ig/ref :gpml.handler.topic.translation/delete-params}
           :handler    #ig/ref :gpml.handler.topic.translation/delete}}]
```

#### 4.2 Add Handler Component Definitions
- [ ] Find handler initializations section (around line 1007-1010)
- [ ] Add after `::upsert-params`:
```clojure
:gpml.handler.topic.translation/get                                #ig/ref [:duct/const :gpml.config/common]
:gpml.handler.topic.translation/get-params                         {}
:gpml.handler.topic.translation/upsert                             #ig/ref [:duct/const :gpml.config/common]
:gpml.handler.topic.translation/upsert-params                      {}
:gpml.handler.topic.translation/delete                             #ig/ref [:duct/const :gpml.config/common]
:gpml.handler.topic.translation/delete-params                      {}
```

### Phase 5: Enhanced Service Functions (for breakdown)

**File**: `backend/src/gpml/service/topic/translation.clj`

#### 5.1 Enhance delete-bulk-topic-translations
- [ ] Modify to return `:by-type` breakdown:
```clojure
(defn delete-bulk-topic-translations
  "Deletes bulk topic translations for multiple topics (all languages)"
  [config topic-filters]
  (try
    (let [conn (:spec (:db config))
          ;; Convert from service layer format to database layer format
          db-topic-filters (mapv (fn [{:keys [topic-type topic-id]}]
                                   [topic-type topic-id])
                                 topic-filters)

          ;; Group by type for breakdown
          by-type (frequencies (map :topic-type topic-filters))

          ;; Execute deletion
          result (db.topic.translation/delete-bulk-topic-translations
                   conn
                   {:topic-filters db-topic-filters})]
      {:success? true
       :deleted-count result
       :by-type by-type})
    (catch Exception e
      (failure {:reason :unexpected-error
                :error-details {:message (.getMessage e)}}))))
```

#### 5.2 Enhance delete-topic-translations-by-type
- [ ] Modify to return `:by-type` breakdown:
```clojure
(defn delete-topic-translations-by-type
  ;; ... (see Phase 2.1)
  ;; Add :by-type to response:
  {:success? true
   :deleted-count result
   :by-type {topic-type result}})
```

### Phase 6: Testing

**File**: `backend/test/gpml/handler/topic/translation_test.clj`

#### 6.1 Setup Test Data
- [ ] Create helper to insert test translations
- [ ] Create test translations across multiple types

#### 6.2 Test Cases
- [ ] Test delete specific topics (admin user):
  - Setup: Insert translations for policy:1, event:2
  - Request: `DELETE ?topics=policy:1,event:2`
  - Verify: Correct count returned, breakdown by type, DB records deleted

- [ ] Test delete by topic-type WITH confirmation (admin user):
  - Setup: Insert multiple policy translations
  - Request: `DELETE ?topic-type=policy&confirm=true`
  - Verify: Only policy translations deleted, others remain

- [ ] Test delete by topic-type WITHOUT confirmation (admin user):
  - Setup: Insert multiple policy translations
  - Request: `DELETE ?topic-type=policy`
  - Verify: 400 Bad Request with confirmation-required error

- [ ] Test delete all WITH confirmation (admin user):
  - Setup: Insert translations of multiple types
  - Request: `DELETE ?confirm=true`
  - Verify: All deleted, correct breakdown

- [ ] Test delete all WITHOUT confirmation (admin user):
  - Setup: Insert translations of multiple types
  - Request: `DELETE` (no params)
  - Verify: 400 Bad Request with confirmation-required error

- [ ] Test unauthorized access (non-admin):
  - Request: `DELETE` with non-admin JWT
  - Verify: 403 Forbidden response

- [ ] Test unauthenticated access:
  - Request: `DELETE` without JWT
  - Verify: 403 Forbidden response

## API Documentation

### Endpoint: DELETE /api/bulk-translations

**Authentication**: Required (JWT token)
**Authorization**: Admin role required
**Query Parameters**: All optional

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `topics` | string | No | Comma-separated topic-type:id pairs. Deletes only these specific topics. No confirmation needed. | `policy:1,event:2,initiative:3` |
| `topic-type` | string | No | Topic type name. Deletes ALL translations of this type. **Requires `confirm=true`**. | `policy` |
| `confirm` | boolean | Conditional | Must be `true` for delete-by-type or delete-all operations. Safety mechanism. | `true` |

**Deletion Patterns**:

1. **Delete specific topics** (no confirmation needed):
   ```bash
   DELETE /api/bulk-translations?topics=policy:123,event:456
   ```

2. **Delete all of a type** (requires confirmation):
   ```bash
   DELETE /api/bulk-translations?topic-type=policy&confirm=true
   ```

   ❌ **Without confirmation** (will fail):
   ```bash
   DELETE /api/bulk-translations?topic-type=policy
   # Returns 400: "Deleting all translations of a type requires confirm=true parameter"
   ```

3. **Delete everything** (requires confirmation):
   ```bash
   DELETE /api/bulk-translations?confirm=true
   ```

   ❌ **Without confirmation** (will fail):
   ```bash
   DELETE /api/bulk-translations
   # Returns 400: "Deleting all translations requires confirm=true parameter"
   ```

**Response Format**:
```json
{
  "success?": true,
  "deleted-count": 42,
  "by-type": {
    "policy": 15,
    "event": 20,
    "initiative": 7
  }
}
```

**Error Responses**:

- **400 Bad Request** (missing confirmation):
  ```json
  {
    "success?": false,
    "reason": "confirmation-required",
    "message": "Deleting all translations requires confirm=true parameter"
  }
  ```

- **403 Forbidden** (non-admin):
  ```json
  {"message": "Unauthorized"}
  ```

- **500 Server Error**:
  ```json
  {
    "success?": false,
    "reason": "unexpected-error",
    "error-details": {"message": "..."}
  }
  ```

## Security Considerations

- ✅ **Admin-only access**: Three-layer middleware ensures only super-admins can access
- ✅ **Confirmation parameter**: `confirm=true` required for dangerous operations (delete-by-type, delete-all)
- ✅ **No language filtering**: Simpler logic, prevents partial deletion issues
- ✅ **Audit trail**: Consider adding logging for admin deletions
- ✅ **Specific topics safe**: Deleting specific topics doesn't require confirmation (explicit intent)

## Implementation Notes

### Middleware Stack Order
```clojure
[#ig/ref :gpml.auth/auth-middleware      ;; 1. Verify JWT token
 #ig/ref :gpml.auth/auth-required        ;; 2. Ensure authenticated
 #ig/ref :gpml.auth/admin-auth-required] ;; 3. Ensure super-admin
```

### Conditional Logic Flow
```
1. Check if :topics provided → delete-bulk-topic-translations (no confirmation needed)
2. Else check if :topic-type provided:
   - If confirm=true → delete-topic-translations-by-type
   - Else → return 400 Bad Request (confirmation required)
3. Else (no params):
   - If confirm=true → delete-all-topic-translations
   - Else → return 400 Bad Request (confirmation required)
4. All functions return breakdown by topic-type
```

### Database Operations
- Delete operations always remove ALL languages
- Counts are retrieved BEFORE deletion (for accurate breakdown)
- No transaction needed (single DELETE statement)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Accidental delete-all | High | **confirm=true parameter required**, admin-only access, clear documentation |
| Accidental delete-by-type | Medium | **confirm=true parameter required**, explicit parameter needed |
| Breaking existing code | Low | Only adds DELETE method, doesn't modify GET/PUT |
| Performance with large datasets | Low | DELETE operations are fast, indexed on (topic_type, topic_id) |
| Missing breakdown data | Low | Calculate counts before deletion |

## Testing Strategy

1. **Unit Tests**: Test service layer functions with mock DB
2. **Integration Tests**: Test handler with test database
3. **Manual Testing**: Test via curl/Postman with admin JWT
4. **Verification**: Check database state after each deletion pattern

## Related Documentation

- **Main Implementation Plan**: `doc/GOOGLE_TRANSLATE_INTEGRATION.md`
- **Translation System**: `doc/TRANSLATION_SYSTEM_IMPLEMENTATION.md`
- **Auth Middleware**: `backend/src/gpml/auth.clj` (line 141-147)
- **Existing Handlers**: `backend/src/gpml/handler/topic/translation.clj`

## Progress Tracking

- [ ] Phase 1: Database Layer (SQL queries, namespace updates)
- [ ] Phase 2: Service Layer (delete-by-type, delete-all functions)
- [ ] Phase 3: Handler Layer (schema, handler implementation)
- [ ] Phase 4: Route Configuration (duct.base.edn updates)
- [ ] Phase 5: Enhanced Service Functions (breakdown responses)
- [ ] Phase 6: Testing (unit + integration tests)
- [ ] Code Review & Documentation
- [ ] Deployment

## Estimated Timeline

- Database & Service Layer: 1-2 hours
- Handler & Route Config: 1-2 hours
- Testing: 2-3 hours
- **Total**: 4-7 hours

---

**Last Updated**: 2025-10-29
**Author**: Claude Code
**Reviewers**: TBD
