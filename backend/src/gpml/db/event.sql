-- :name new-event :<!
-- :doc Insert a new event
insert into event(title, start_date, end_date, description, remarks)
values(:title, :start_date::timestamptz, :end_date::timestamptz, :description, :remarks) returning id;
