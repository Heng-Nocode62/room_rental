

INSERT INTO pricing_units (id, code, name)
VALUES
    (1, 'HOURLY', 'Hourly'),
    (2, 'DAILY', 'Daily');



INSERT INTO reservation_statuses
(id, code, name, description)
VALUES
    (1, 'PENDING', 'Pending', 'Reservation created but not confirmed'),

    (2, 'CONFIRMED', 'Confirmed', 'Reservation confirmed'),

    (3, 'CHECKED_IN', 'Checked In', 'Customer has arrived'),

    (4, 'COMPLETED', 'Completed', 'Reservation completed'),

    (5, 'CANCELLED', 'Cancelled', 'Reservation cancelled'),

    (6, 'NO_SHOW', 'No Show', 'Customer did not arrive');



INSERT INTO amenities (id, name, description)
VALUES
    (1, 'Projector', 'Projector available'),
    (2, 'Whiteboard', 'Whiteboard available'),
    (3, 'Television', 'Large display television'),
    (4, 'WiFi', 'Wireless internet'),
    (5, 'Video Conference', 'Video conferencing equipment'),
    (6, 'Air Conditioning', 'Air conditioning');



INSERT INTO locations
(id, name, code, address, phone, time_zone)
VALUES
    (
        1,
        'Head Office',
        'HQ',
        'Phnom Penh',
        '012345678',
        'Asia/Phnom_Penh'
    );



INSERT INTO room_types
(id, name, code, description, capacity)
VALUES
    (
        1,
        'Meeting Room',
        'MTG',
        'Small meeting room',
        10
    ),

    (
        2,
        'Private Office',
        'OFF',
        'Private office',
        4
    ),

    (
        3,
        'Conference Room',
        'CONF',
        'Large conference room',
        30
    ),

    (
        4,
        'Training Room',
        'TRAIN',
        'Training and workshop room',
        50
    );



INSERT INTO rooms
(
    id,
    location_id,
    room_type_id,
    room_number,
    name,
    floor,
    description
)
VALUES

    (
        1,
        1,
        1,
        'M-01',
        'Meeting Room 01',
        '2',
        'Main meeting room'
    ),

    (
        2,
        1,
        1,
        'M-02',
        'Meeting Room 02',
        '2',
        'Secondary meeting room'
    ),

    (
        3,
        1,
        2,
        'O-01',
        'Private Office 01',
        '3',
        'Private office'
    ),

    (
        4,
        1,
        3,
        'C-01',
        'Conference Room',
        '1',
        'Large conference room'
    );



INSERT INTO room_amenities
(room_id, amenity_id)
VALUES

    (1, 1),
    (1, 2),
    (1, 4),
    (1, 6),

    (2, 2),
    (2, 3),
    (2, 4),

    (3, 3),
    (3, 4),
    (3, 6),

    (4, 1),
    (4, 2),
    (4, 3),
    (4, 4),
    (4, 5),
    (4, 6);


INSERT INTO room_prices
(
    id,
    room_id,
    pricing_unit_id,
    price,
    currency_code,
    effective_from
)
VALUES

    (
        1,
        1,
        1,
        10.00,
        'USD',
        CURRENT_DATE
    ),

    (
        2,
        1,
        2,
        70.00,
        'USD',
        CURRENT_DATE
    ),

    (
        3,
        2,
        1,
        12.00,
        'USD',
        CURRENT_DATE
    ),

    (
        4,
        2,
        2,
        80.00,
        'USD',
        CURRENT_DATE
    ),

    (
        5,
        3,
        1,
        8.00,
        'USD',
        CURRENT_DATE
    ),

    (
        6,
        3,
        2,
        50.00,
        'USD',
        CURRENT_DATE
    ),

    (
        7,
        4,
        1,
        20.00,
        'USD',
        CURRENT_DATE
    ),

    (
        8,
        4,
        2,
        140.00,
        'USD',
        CURRENT_DATE
    );





ALTER TABLE pricing_units
    ALTER COLUMN id RESTART WITH 3;

ALTER TABLE reservation_statuses
    ALTER COLUMN id RESTART WITH 7;

ALTER TABLE locations
    ALTER COLUMN id RESTART WITH 2;

ALTER TABLE room_types
    ALTER COLUMN id RESTART WITH 5;

ALTER TABLE rooms
    ALTER COLUMN id RESTART WITH 5;

ALTER TABLE amenities
    ALTER COLUMN id RESTART WITH 7;

ALTER TABLE room_prices
    ALTER COLUMN id RESTART WITH 9;