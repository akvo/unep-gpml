(ns gpml.db.project
  {:ns-tracker/resource-deps ["project.sql"]}
  (:require [gpml.util :as util]
            [gpml.util.postgresql :as pg-util]
            [hugsql.core :as hugsql]))

(declare get-projects
         create-projects
         update-project
         delete-projects
         ;; FIXME: remove these function once PR #1437 is merged.
         project-actions-id
         project-actions-details)

(hugsql/def-db-fns "gpml/db/project.sql" {:quoting :ansi})

(defn opts->db-opts
  "Transform optional argument map values into DB layer specific values."
  [opts]
  (-> opts
      (util/update-if-not-nil :ids #(pg-util/->JDBCArray % "uuid"))
      (util/update-if-not-nil :geo_coverage_types #(pg-util/->JDBCArray % "geo_coverage_type"))
      (util/update-if-not-nil :types #(pg-util/->JDBCArray % "project_type"))
      (util/update-if-not-nil :stages #(pg-util/->JDBCArray % "project_stage"))))

(defn db-project->project
  "Transform database project type into domain types."
  [project]
  (util/update-if-exists project :source keyword))

(defn project->db-project
  "Transform project to be ready to be persisted in DB"
  [project]
  (-> project
      (util/update-if-not-nil :geo_coverage_type #(pg-util/->PGEnum % "geo_coverage_type"))
      (util/update-if-not-nil :type #(pg-util/->PGEnum % "project_type"))
      (util/update-if-not-nil :checklist pg-util/val->jsonb)
      (util/update-if-not-nil :answers pg-util/val->jsonb)
      (util/update-if-not-nil :stage #(pg-util/->PGEnum % "project_stage"))
      (util/update-if-not-nil :source #(pg-util/->PGEnum % "resource_source"))
      (dissoc :geo_coverage_countries :geo_coverage_country_groups :geo_coverage_country_states)))
