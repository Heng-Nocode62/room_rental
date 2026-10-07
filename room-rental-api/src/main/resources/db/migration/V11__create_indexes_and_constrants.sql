CREATE EXTENSION IF NOT EXISTS btree_gist;


CREATE INDEX idx_rooms_location
    ON rooms(location_id);

CREATE INDEX idx_rooms_room_type
    ON rooms(room_type_id);

CREATE INDEX idx_rooms_status
    ON rooms(status);


CREATE INDEX idx_room_amenities_amenity
    ON room_amenities(amenity_id);


CREATE INDEX idx_room_prices_room
    ON room_prices(room_id);

CREATE INDEX idx_room_prices_pricing_unit
    ON room_prices(pricing_unit_id);


CREATE INDEX idx_reservations_room
    ON reservations(room_id);

CREATE INDEX idx_reservations_status
    ON reservations(status_id);

CREATE INDEX idx_reservations_start_at
    ON reservations(start_at);

CREATE INDEX idx_reservations_end_at
    ON reservations(end_at);


CREATE INDEX idx_room_blocks_room
    ON room_blocks(room_id);

CREATE INDEX idx_room_blocks_start_at
    ON room_blocks(start_at);


CREATE INDEX idx_audit_logs_user
    ON audit_logs(user_id);

CREATE INDEX idx_audit_logs_entity
    ON audit_logs(entity_type, entity_id);

CREATE INDEX idx_audit_logs_created_at
    ON audit_logs(created_at DESC);



-- prevent reservation overlap

ALTER TABLE reservations
    ADD CONSTRAINT ex_reservations_no_overlap
    EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(start_at, end_at, '[)') WITH &&
)
WHERE (
    status_id IN (1, 2, 3)
);


-- pricing overlap protection

ALTER TABLE room_prices
    ADD CONSTRAINT ex_room_prices_no_overlap
    EXCLUDE USING gist (
    room_id WITH =,
    pricing_unit_id WITH =,
    daterange(
        effective_from,
        COALESCE(effective_to, 'infinity'::date),
        '[)'
    ) WITH &&
)
WHERE (
    status = 'ACTIVE'
);