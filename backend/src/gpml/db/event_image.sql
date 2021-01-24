-- :name event-image-by-id :? :1
-- :doc Get event image by id
select * from event_image where id = :id

-- :name new-event-image :<!
-- :doc Insert new event image
insert into event_image (image)
values(:image) returning id;
