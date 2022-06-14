(ns gpml.constants)

(def ^:const topic-tables
  "The list of tables considered as topics in the current model of the
  GPML platform as of 2022-03-16."
  ["event" "technology" "policy" "initiative" "resource"])

(def ^:const geo-coverage-entity-tables
  "The list of tables with geo coverage relations."
  (apply conj topic-tables ["organisation" "stakeholder" "non_member_organisation"]))

(def resource-types #{"financing_resource" "technical_resource" "action_plan"})
(def ^:const resources (concat resource-types (butlast topic-tables)))
(def approved-user-topics #{"stakeholder"})
(def stakeholder-types #{"individual" "entity"})
(def topics
  (vec
   (sort
    (apply conj resource-types ["event" "technology" "policy" "project" "stakeholder" "organisation" "non_member_organisation"]))))

(def reviewer-review-status [:PENDING :ACCEPTED :REJECTED])

(def admin-review-status [:SUBMITTED :APPROVED])

(def user-roles [:USER :REVIEWER :ADMIN])

(def popular-tags '("plastics" "waste management" "marine litter" "capacity building" "product by design" "source to sea"))

(def gcs-bucket-name "akvo-unep-gpml")

(def ^:const sorted-user-columns
  ["ID"
   "Title"
   "Email"
   "First name"
   "Last name"
   "Role"
   "About"
   "Affiliation"
   "Job Title"
   "Representative sector"
   "Organisation Role"
   "Twitter"
   "LinkedIn"
   "Link"
   "Public Database"
   "Public Email"
   "CV"
   "Photo"
   "Country"
   "Geo coverage type"
   "Review Status"
   "Reviewed By"
   "Reviewed At"
   "Created"
   "Modified"
   "IdP Usernames"])

(def ^:const users-key-map
  {:id "ID"
   :title "Title"
   :email "Email"
   :first_name "First name"
   :last_name "Last name"
   :role "Role"
   :about "About"
   :affiliation "Affiliation"
   :job_title "Job Title"
   :representation "Representative sector"
   :organisation_role "Organisation Role"
   :twitter "Twitter"
   :linked_in "LinkedIn"
   :url "Link"
   :public_database "Public Database"
   :public_email "Public Email"
   :cv "CV"
   :picture "Photo"
   :country "Country"
   :geo_coverage_type "Geo coverage type"
   :review_status "Review Status"
   :reviewed_by "Reviewed By"
   :reviewed_at "Reviewed At"
   :created "Created"
   :modified "Modified"
   :idp_usernames "IdP Usernames"})

(def ^:const sorted-entity-columns
  ["ID"
   "Name"
   "Representative group"
   "Representative group: Government"
   "Representative group: Private sector (for-profit)"
   "Representative group: Academia & Research"
   "Representative group: Civil Society (not-for-profit)"
   "Representative group: Other"
   "Program"
   "Expertise"
   "Contribution"
   "Website"
   "Logo"
   "Country"
   "Geographical Coverage"
   "Sub-national Geo Coverage"
   "Second contact"
   "Review Status"
   "Reviewed by"
   "Reviewed at"
   "Created"
   "Created by"
   "Modified"])

(def ^:const entities-key-map
  {:id "ID"
   :name "Name"
   :type "Representative group"
   :representative_group_government "Representative group: Government"
   :representative_group_private_sector "Representative group: Private sector (for-profit)"
   :representative_group_academia_research "Representative group: Academia & Research"
   :representative_group_civil_society "Representative group: Civil Society (not-for-profit)"
   :representative_group_other "Representative group: Other"
   :program "Program"
   :expertise "Expertise"
   :contribution "Contribution"
   :url "Website"
   :logo "Logo"
   :country "Country"
   :geo_coverage_type "Geographical Coverage"
   :subnational_area "Sub-national Geo Coverage"
   :second_contact "Second contact"
   :review_status "Review Status",
   :reviewed_by "Reviewed by"
   :reviewed_at "Reviewed at"
   :created_by "Created by"
   :created "Created"
   :modified "Modified"})

(def ^:const sorted-tag-columns
  ["ID"
   "Category"
   "Tag"
   "Review status"
   "Reviewed by"
   "Reviewed at"
   "Definition"
   "Ontology"])

(def ^:const tags-key-map
  {:id "ID"
   :tag_category "Category"
   :tag "Tag"
   :review_status "Review status"
   :reviewed_by "Reviewed by"
   :reviewed_at "Reviewed at"
   :definition "Definition"
   :ontology_ref_link "Ontology"})

(def ^:const sorted-topic-columns
  ["ID"
   "Topic"
   "Title"
   "Original title"
   "Submitting as"
   "Version"
   "Summary"
   "Image"
   "Logo"
   "URL"
   "Publish year"
   "Country"
   "City"
   "Geo coverage type"
   "Subnational city"
   "Headquarter"
   "Remarks"
   "Attachments"
   "Info docs"
   "Sub content type"
   "Capacity building"
   "Related Content"
   "Created"
   "Modified"
   "Review status"
   "Reviewed at"
   "Reviewed by"
   "Created by"
   "Document Preview"
   "Event type"
   "Value"
   "Value currency"
   "Value remarks"
   "Recording"
   "Start date"
   "End date"
   "Valid from"
   "Valid To"
   "First publication date"
   "Latest amendment date"
   "Email"
   "Data source"
   "Implementing mea"
   "Topics"
   "Repeals"
   "Language"
   "Organisation type"
   "Development stage"
   "Status"
   "Type of law"
   "Specification provided"
   "Regulatory Approach"
   "Toolkit legislation"
   "Record number"
   "Publication reference"
   "SDG Initiative"
   "Reporting to"
   "Entity Connections"
   "Q1_1"
   "Q1_1_1"
   "Q4"
   "Q4_1_1"
   "Q4_1_2"
   "Q4_2_1"
   "Q4_3_1"
   "Q4_4_1"
   "Q4_4_3"
   "Q4_4_4"
   "Q4_4_5"
   "Q5"
   "Q7_1_1"
   "Q7_1_2"
   "Q7_2"
   "Q8"
   "Q9"
   "Q10"
   "Q11"
   "Q12"
   "Q13"
   "Q14"
   "Q15"
   "Q16"
   "Q17"
   "Q18"
   "Q19"
   "Q20"
   "Q21"
   "Q22"
   "Q24_1"
   "Q24_2"
   "Q24_3"
   "Q24_4"
   "Q24_5"
   "Q26"
   "Q27"
   "Q28"
   "Q29"
   "Q30"
   "Q31"
   "Q32"
   "Q33"
   "Q34"
   "Q35"
   "Q35_1"
   "Q36"
   "Q36_1"
   "Q37"
   "Q37_1"
   "Q38"
   "Q39"
   "Q40"
   "Q41"
   "Q41_1"])

(def ^:const topics-key-map
  {:entity_connections "Entity Connections"
   :q24_2 "Q24_2",
   :q37 "Q37",
   :remarks "Remarks",
   :q32 "Q32",
   :headquarter "Headquarter",
   :q11 "Q11",
   :recording "Recording",
   :valid_to "Valid To",
   :email "Email",
   :q26 "Q26",
   :q20 "Q20",
   :q7_2 "Q7_2",
   :publish_year "Publish year",
   :q12 "Q12",
   :specifications_provided "Specification provided",
   :q1_1_1 "Q1_1_1",
   :geo_coverage_type "Geo coverage type",
   :q4_4_3 "Q4_4_3",
   :q14 "Q14",
   :logo "Logo",
   :q9 "Q9",
   :q36_1 "Q36_1",
   :regulatory_approach "Regulatory Approach",
   :value "Value",
   :city "City",
   :attachments "Attachments",
   :related_content "Related Content",
   :sub_content_type "Sub content type",
   :publication_reference "Publication reference",
   :sdg_initiative "SDG Initiative",
   :document_preview "Document Preview",
   :q4_4_1 "Q4_4_1",
   :development_stage "Development stage",
   :q4_4_5 "Q4_4_5",
   :created "Created"
   :q4_1_2 "Q4_1_2",
   :subnational_city "Subnational city",
   :topic "Topic",
   :valid_from "Valid from",
   :q21 "Q21",
   :q17 "Q17",
   :value_currency "Value currency",
   :modified "Modified",
   :title "Title",
   :record_number "Record number",
   :topics "Topics",
   :summary "Summary",
   :q24_1 "Q24_1",
   :reporting_to "Reporting to",
   :q33 "Q33",
   :q41_1 "Q41_1",
   :q28 "Q28",
   :toolkit_legislation "Toolkit legislation",
   :original_title "Original title",
   :organisation_type "Organisation type",
   :end_date "End date",
   :latest_amendment_date "Latest amendment date",
   :q37_1 "Q37_1",
   :q8 "Q8",
   :start_date "Start date",
   :status "Status",
   :language "Language",
   :id "ID",
   :first_publication_date "First publication date",
   :q35 "Q35",
   :url "URL",
   :q16 "Q16",
   :q39 "Q39",
   :q4_3_1 "Q4_3_1",
   :q27 "Q27",
   :q13 "Q13",
   :q31 "Q31",
   :q19 "Q19",
   :q5 "Q5",
   :q38 "Q38",
   :q4_1_1 "Q4_1_1",
   :q10 "Q10",
   :review_status "Review status",
   :image "Image",
   :reviewed_by "Reviewed by",
   :q7_1_1 "Q7_1_1",
   :info_docs "Info docs",
   :data_source "Data source",
   :implementing_mea "Implementing mea",
   :q35_1 "Q35_1",
   :q30 "Q30",
   :value_remarks "Value remarks",
   :event_type "Event type",
   :q24_4 "Q24_4",
   :version "Version",
   :q24_5 "Q24_5",
   :reviewed_at "Reviewed at",
   :capacity_building "Capacity building",
   :q36 "Q36",
   :q4 "Q4",
   :submitting_as "Submitting as",
   :q7_1_2 "Q7_1_2",
   :q4_2_1 "Q4_2_1",
   :q24_3 "Q24_3",
   :q15 "Q15",
   :created_by "Created by",
   :country "Country",
   :type_of_law "Type of law",
   :q29 "Q29",
   :q40 "Q40",
   :q1_1 "Q1_1",
   :q34 "Q34",
   :q18 "Q18",
   :repeals "Repeals",
   :q41 "Q41",
   :q22 "Q22",
   :q4_4_4 "Q4_4_4"})
