-- :name get-chat-curated-channels* :query :many
SELECT * FROM chat_curated_channel;

-- :name create-chat-curated-channel* :execute :affected
INSERT INTO chat_curated_channel(id)
VALUES (:id);

-- :name delete-chat-curated-channel* :execute :affected
DELETE FROM chat_curated_channel
WHERE id = :id;
