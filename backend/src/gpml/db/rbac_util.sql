-- :name get-users-with-granted-permission-on-resource :? :*
/* :doc
The query below assume the following facts are true:

We don't care if a given user has both the permission granted and
denied (through the same role, or through different roles, in the
same context or in different contexts in the hierarchy of the
resource). As long as the user has the permission granted at least
in one place, we return that user in the list returned by the
query.

When looking for users to include in the returned list, we search
for them starting at the context associated by the specified
resource (by its id), and keep looking for users in all the contexts
in the 'ancestor hierarchy' up to (and including) the root of the
context tree.

If any of those facts are not true for your use case, then this
query won't be the one you want to use.
*/
WITH RECURSIVE ancestors_of_context (
    id,
    parent
) AS (
    SELECT
        id,
        parent
    FROM
        rbac_context rc
    WHERE
        rc.resource_id = :resource-id
    UNION ALL
    SELECT
        rc.id,
        rc.parent
    FROM
        rbac_context rc
        INNER JOIN ancestors_of_context ao ON rc.id = ao.parent
),
users_with_permission_granted AS (
    SELECT DISTINCT
        (rra.user_id)
    FROM
        rbac_role_assignment rra
        INNER JOIN ancestors_of_context ao ON ao.id = rra.context_id
        INNER JOIN rbac_role_permission rrp ON rrp.role_id = rra.role_id
        INNER JOIN rbac_permission rp ON rp.id = rrp.permission_id
    WHERE
        rp.name = :permission-name
        AND rp.context_type_name = :context-type-name
        AND rrp.permission_value = 1
    UNION
    SELECT
        user_id
    FROM
        rbac_super_admin
)
SELECT
    *
FROM
    users_with_permission_granted;

-- :name unassign-all-roles :execute :affected
DELETE FROM rbac_role_assignment
WHERE user_id = :user-id;
