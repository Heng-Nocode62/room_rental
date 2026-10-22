
INSERT INTO modules (id, name, is_active, created_at, updated_at) VALUES
    (4,  'Amenity Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (5,  'Reservation Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (6,  'Location Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (7,  'Logging Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (8,  'Pricing Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (9,  'Configuration Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (10, 'Payment Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (11, 'Dashboard Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (12, 'Room Type Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (13, 'Translation Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (14, 'Setting Management Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (15, 'Role Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (16, 'Language Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-28T09:49:49.346Z'),
    (17, 'Permission Management', TRUE, '2026-09-29T10:21:11.081Z', '2026-09-29T10:21:11.081Z'),
    (18, 'Module Management', TRUE, '2026-09-29T11:31:15.201Z', '2026-09-30T02:45:07.366Z'),
    (2,  'User Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-30T02:45:56.422Z'),
    (3,  'Availability Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-30T02:52:38.703Z'),
    (1,  'Room Management', TRUE, '2026-09-28T09:49:49.346Z', '2026-09-30T02:52:42.391Z')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    is_active = EXCLUDED.is_active,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

SELECT setval(
    pg_get_serial_sequence('modules', 'id'),
    (SELECT COALESCE(MAX(id), 1) FROM modules),
    EXISTS (SELECT 1 FROM modules)
);
