-- :name create-ps-bookmark* :execute :affected
INSERT INTO :i:ps-bookmark-table(plastic_strategy_id, :i:ps-bookmark-entity-col)
VALUES (:ps-id, :ps-bookmark-entity-id);

-- :name delete-ps-bookmark* :execute :affected
DELETE FROM :i:ps-bookmark-table
WHERE plastic_strategy_id = :ps-id
      AND :i:ps-bookmark-entity-col = :ps-bookmark-entity-id;
