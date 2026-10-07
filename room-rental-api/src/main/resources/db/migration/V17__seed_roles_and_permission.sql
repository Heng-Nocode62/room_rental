-- ============================================================
-- PERMISSIONS
-- ============================================================

INSERT INTO permissions
(code, name, description)
VALUES

    -- ========================================================
    -- LOCATION
    -- ========================================================

    (
        'LOCATION_VIEW',
        'View locations',
        'Allows viewing locations'
    ),
    (
        'LOCATION_CREATE',
        'Create locations',
        'Allows creating locations'
    ),
    (
        'LOCATION_UPDATE',
        'Update locations',
        'Allows updating locations'
    ),
    (
        'LOCATION_DEACTIVATE',
        'Deactivate locations',
        'Allows deactivating locations'
    ),


    -- ========================================================
    -- OPERATING HOURS
    -- ========================================================

    (
        'OPERATING_HOURS_VIEW',
        'View operating hours',
        'Allows viewing location operating hours'
    ),
    (
        'OPERATING_HOURS_MANAGE',
        'Manage operating hours',
        'Allows creating and updating location operating hours'
    ),


    -- ========================================================
    -- ROOM
    -- ========================================================

    (
        'ROOM_VIEW',
        'View rooms',
        'Allows viewing rooms'
    ),
    (
        'ROOM_CREATE',
        'Create rooms',
        'Allows creating rooms'
    ),
    (
        'ROOM_UPDATE',
        'Update rooms',
        'Allows updating rooms'
    ),
    (
        'ROOM_DEACTIVATE',
        'Deactivate rooms',
        'Allows deactivating rooms'
    ),


    -- ========================================================
    -- ROOM TYPE
    -- ========================================================

    (
        'ROOM_TYPE_VIEW',
        'View room types',
        'Allows viewing room types'
    ),
    (
        'ROOM_TYPE_CREATE',
        'Create room types',
        'Allows creating room types'
    ),
    (
        'ROOM_TYPE_UPDATE',
        'Update room types',
        'Allows updating room types'
    ),
    (
        'ROOM_TYPE_DEACTIVATE',
        'Deactivate room types',
        'Allows deactivating room types'
    ),


    -- ========================================================
    -- AMENITY
    -- ========================================================

    (
        'AMENITY_VIEW',
        'View amenities',
        'Allows viewing amenities'
    ),
    (
        'AMENITY_CREATE',
        'Create amenities',
        'Allows creating amenities'
    ),
    (
        'AMENITY_UPDATE',
        'Update amenities',
        'Allows updating amenities'
    ),
    (
        'AMENITY_DEACTIVATE',
        'Deactivate amenities',
        'Allows deactivating amenities'
    ),
    (
        'ROOM_AMENITY_MANAGE',
        'Manage room amenities',
        'Allows assigning and removing amenities from rooms'
    ),


    -- ========================================================
    -- ROOM PRICE
    -- ========================================================

    (
        'ROOM_PRICE_VIEW',
        'View room prices',
        'Allows viewing room prices'
    ),
    (
        'ROOM_PRICE_CREATE',
        'Create room prices',
        'Allows creating room prices'
    ),
    (
        'ROOM_PRICE_UPDATE',
        'Update room prices',
        'Allows updating room prices'
    ),
    (
        'ROOM_PRICE_DEACTIVATE',
        'Deactivate room prices',
        'Allows deactivating room prices'
    ),


    -- ========================================================
    -- AVAILABILITY
    -- ========================================================

    (
        'AVAILABILITY_VIEW',
        'View availability',
        'Allows viewing room availability'
    ),


    -- ========================================================
    -- RESERVATION
    -- ========================================================

    (
        'RESERVATION_VIEW',
        'View reservations',
        'Allows viewing reservations'
    ),
    (
        'RESERVATION_CREATE',
        'Create reservations',
        'Allows creating reservations'
    ),
    (
        'RESERVATION_CANCEL',
        'Cancel reservations',
        'Allows cancelling reservations'
    ),
    (
        'RESERVATION_CHECK_IN',
        'Check in reservations',
        'Allows checking in reservations'
    ),
    (
        'RESERVATION_CHECK_OUT',
        'Check out reservations',
        'Allows checking out reservations'
    ),


    -- ========================================================
    -- ROOM BLOCK
    -- ========================================================

    (
        'ROOM_BLOCK_VIEW',
        'View room blocks',
        'Allows viewing room blocks'
    ),
    (
        'ROOM_BLOCK_CREATE',
        'Create room blocks',
        'Allows creating room blocks'
    ),
    (
        'ROOM_BLOCK_CANCEL',
        'Cancel room blocks',
        'Allows cancelling room blocks'
    ),
    (
        'ROOM_BLOCK_COMPLETE',
        'Complete room blocks',
        'Allows completing room blocks'
    ),


    -- ========================================================
    -- USER
    -- ========================================================

    (
        'USER_VIEW',
        'View users',
        'Allows viewing users'
    ),
    (
        'USER_CREATE',
        'Create users',
        'Allows creating users'
    ),
    (
        'USER_UPDATE',
        'Update users',
        'Allows updating users'
    ),
    (
        'USER_DEACTIVATE',
        'Deactivate users',
        'Allows deactivating users'
    ),
    (
        'USER_ROLE_MANAGE',
        'Manage user roles',
        'Allows assigning and removing roles from users'
    ),


    -- ========================================================
    -- ROLE
    -- ========================================================

    (
        'ROLE_VIEW',
        'View roles',
        'Allows viewing roles'
    ),
    (
        'ROLE_CREATE',
        'Create roles',
        'Allows creating roles'
    ),
    (
        'ROLE_UPDATE',
        'Update roles',
        'Allows updating roles'
    ),
    (
        'ROLE_DELETE',
        'Delete roles',
        'Allows deleting roles'
    ),
    (
        'ROLE_PERMISSION_MANAGE',
        'Manage role permissions',
        'Allows assigning and removing permissions from roles'
    ),


    -- ========================================================
    -- PERMISSION
    -- ========================================================

    (
        'PERMISSION_VIEW',
        'View permissions',
        'Allows viewing available permissions'
    ),


    -- ========================================================
    -- AUDIT
    -- ========================================================

    (
        'AUDIT_VIEW',
        'View audit logs',
        'Allows viewing audit history'
    )

    ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- ROLES
-- ============================================================

INSERT INTO roles
(code, name, description)
VALUES
    (
        'ADMIN',
        'Administrator',
        'Full system access'
    ),
    (
        'MANAGER',
        'Manager',
        'Manages room rental operations'
    ),
    (
        'STAFF',
        'Staff',
        'Performs daily room rental operations'
    )

    ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- ADMIN
-- Give ADMIN every permission
-- ============================================================

INSERT INTO role_permissions (
    role_id,
    permission_id
)
SELECT
    r.id,
    p.id
FROM roles r
         CROSS JOIN permissions p
WHERE r.code = 'ADMIN'

    ON CONFLICT DO NOTHING;


-- ============================================================
-- MANAGER
-- Operational management permissions
-- ============================================================

INSERT INTO role_permissions (
    role_id,
    permission_id
)
SELECT
    r.id,
    p.id
FROM roles r
         JOIN permissions p
              ON p.code IN (

                  -- Locations
                            'LOCATION_VIEW',
                            'LOCATION_CREATE',
                            'LOCATION_UPDATE',
                            'LOCATION_DEACTIVATE',

                  -- Operating hours
                            'OPERATING_HOURS_VIEW',
                            'OPERATING_HOURS_MANAGE',

                  -- Rooms
                            'ROOM_VIEW',
                            'ROOM_CREATE',
                            'ROOM_UPDATE',
                            'ROOM_DEACTIVATE',

                  -- Room types
                            'ROOM_TYPE_VIEW',
                            'ROOM_TYPE_CREATE',
                            'ROOM_TYPE_UPDATE',
                            'ROOM_TYPE_DEACTIVATE',

                  -- Amenities
                            'AMENITY_VIEW',
                            'AMENITY_CREATE',
                            'AMENITY_UPDATE',
                            'AMENITY_DEACTIVATE',
                            'ROOM_AMENITY_MANAGE',

                  -- Pricing
                            'ROOM_PRICE_VIEW',
                            'ROOM_PRICE_CREATE',
                            'ROOM_PRICE_UPDATE',
                            'ROOM_PRICE_DEACTIVATE',

                  -- Availability
                            'AVAILABILITY_VIEW',

                  -- Reservations
                            'RESERVATION_VIEW',
                            'RESERVATION_CREATE',
                            'RESERVATION_CANCEL',
                            'RESERVATION_CHECK_IN',
                            'RESERVATION_CHECK_OUT',

                  -- Room blocks
                            'ROOM_BLOCK_VIEW',
                            'ROOM_BLOCK_CREATE',
                            'ROOM_BLOCK_CANCEL',
                            'ROOM_BLOCK_COMPLETE',

                  -- Users
                            'USER_VIEW',

                  -- Roles / permissions
                            'ROLE_VIEW',
                            'PERMISSION_VIEW',

                  -- Audit
                            'AUDIT_VIEW'
                  )
WHERE r.code = 'MANAGER'

    ON CONFLICT DO NOTHING;


-- ============================================================
-- STAFF
-- Day-to-day operational permissions
-- ============================================================

INSERT INTO role_permissions (
    role_id,
    permission_id
)
SELECT
    r.id,
    p.id
FROM roles r
         JOIN permissions p
              ON p.code IN (

                  -- Locations
                            'LOCATION_VIEW',

                  -- Operating hours
                            'OPERATING_HOURS_VIEW',

                  -- Rooms
                            'ROOM_VIEW',

                  -- Room types
                            'ROOM_TYPE_VIEW',

                  -- Amenities
                            'AMENITY_VIEW',
                            'ROOM_AMENITY_MANAGE',

                  -- Pricing
                            'ROOM_PRICE_VIEW',

                  -- Availability
                            'AVAILABILITY_VIEW',

                  -- Reservations
                            'RESERVATION_VIEW',
                            'RESERVATION_CREATE',
                            'RESERVATION_CANCEL',
                            'RESERVATION_CHECK_IN',
                            'RESERVATION_CHECK_OUT',

                  -- Room blocks
                            'ROOM_BLOCK_VIEW',
                            'ROOM_BLOCK_CREATE',
                            'ROOM_BLOCK_CANCEL',
                            'ROOM_BLOCK_COMPLETE',

                  -- Audit
                            'AUDIT_VIEW'
                  )
WHERE r.code = 'STAFF'

    ON CONFLICT DO NOTHING;