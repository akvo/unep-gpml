-- :name add-ps-team-member* :execute :affected
INSERT INTO plastic_strategy_team_member(plastic_strategy_id, user_id, teams, role)
VALUES (:plastic-strategy-id, :user-id, :teams, :role::PLASTIC_STRATEGY_TEAM_ROLE);

-- :name update-ps-team-member* :execute :affected
UPDATE plastic_strategy_team_member
SET last_updated_at = now()
--~(when (get-in params [:updates :teams]) ", teams = :updates.teams")
--~(when (seq (get-in params [:updates :role])) ", role = :updates.role::PLASTIC_STRATEGY_TEAM_ROLE")
WHERE plastic_strategy_id = :plastic-strategy-id
      AND user_id = :user-id;

-- :name delete-ps-team-member* :execute :affected
DELETE FROM plastic_strategy_team_member
WHERE plastic_strategy_id = :plastic-strategy-id
      AND user_id = :user-id;

-- :name get-ps-team-members* :query :many
SELECT pstm.plastic_strategy_id, pstm.teams, pstm.role,
       s.id, s.first_name, s.last_name, s.email,
       row_to_json(org.*) AS org
FROM plastic_strategy_team_member pstm
JOIN stakeholder s ON pstm.user_id = s.id
LEFT JOIN organisation org ON s.affiliation = org.id
WHERE 1=1
--~(when (seq (get-in params [:filters :plastic-strategies-ids])) " AND pstm.plastic_strategy_id IN (:v*:filters.plastic-strategies-ids)")
--~(when (seq (get-in params [:filters :users-ids])) " AND pstm.user_id IN (:v*:filters.users-ids)")
;
