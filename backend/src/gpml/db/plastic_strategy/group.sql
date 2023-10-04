-- :name assign-user-to-group* :execute :affected
INSERT INTO plastic_strategy_group_assignment(plastic_strategy_id, user_id, group_type, role)
VALUES (:plastic-strategy-id, :user-id, :group-type::PLASTIC_STRATEGY_GROUP, :role::PLASTIC_STRATEGY_GROUP_ROLE);

-- :name unassign-user-from-group* :execute :affected
DELETE FROM plastic_strategy_group_assignment
WHERE plastic_strategy_id = :plastic-strategy-id
      AND user_id = :user-id
      AND group_type = :group-type::PLASTIC_STRATEGY_GROUP;
