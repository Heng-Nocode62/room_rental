
INSERT INTO roles (id, code, name, description, is_active, created_at, updated_at) VALUES
    (1, 'ADMIN', 'Administrator', 'Full system access', TRUE, '2026-09-14T09:15:00.113Z', '2026-09-14T09:15:00.113Z'),
    (3, 'STAFF', 'Staff', 'Performs daily room rental operations', TRUE, '2026-09-14T09:15:00.113Z', '2026-09-14T09:15:00.113Z'),
    (4, 'USER', 'USER', 'Perform user operation', TRUE, '2026-09-22T05:21:47.836Z', '2026-09-22T05:21:47.836Z'),
    (6, 'OWNER', 'Owner', 'Full Access of a location.', TRUE, '2026-09-27T09:48:22.129Z', '2026-09-27T09:48:22.129Z')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

SELECT setval(
    pg_get_serial_sequence('roles', 'id'),
    (SELECT COALESCE(MAX(id), 1) FROM roles),
    EXISTS (SELECT 1 FROM roles)
);
