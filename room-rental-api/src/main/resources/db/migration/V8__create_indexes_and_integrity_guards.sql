CREATE INDEX idx_permissions_module_id ON permissions(module_id);
CREATE INDEX idx_user_location_roles_user_id ON user_location_roles(user_id);
CREATE INDEX idx_user_location_roles_location_id ON user_location_roles(location_id);
CREATE INDEX idx_location_operating_hours_location_id ON location_operating_hours(location_id);
CREATE INDEX idx_rooms_location ON rooms(location_id);
CREATE INDEX idx_rooms_room_type ON rooms(room_type_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_room_amenities_amenity ON room_amenities(amenity_id);
CREATE INDEX idx_amenities_location_id ON amenities(location_id);
CREATE INDEX idx_room_prices_room ON room_prices(room_id);
CREATE INDEX idx_room_prices_pricing_unit ON room_prices(pricing_unit_id);
CREATE INDEX idx_reservations_room ON reservations(room_id);
CREATE INDEX idx_reservations_status ON reservations(status_id);
CREATE INDEX idx_reservations_start_at ON reservations(start_at);
CREATE INDEX idx_reservations_end_at ON reservations(end_at);
CREATE INDEX idx_reservation_amenities_amenity ON reservation_amenities(amenity_id);
CREATE INDEX idx_room_blocks_room_time ON room_blocks(room_id, start_at, end_at);
CREATE INDEX idx_room_blocks_status ON room_blocks(status);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_email_verification_otps_email ON email_verification_otps(email);
CREATE INDEX idx_password_reset_otp_email_created ON password_reset_otps(email, created_at);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_method ON activity_logs(method);
CREATE INDEX idx_activity_logs_status ON activity_logs(response_status);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_model_logs_type_id ON model_logs(model_type, model_id);
CREATE INDEX idx_model_logs_user_id ON model_logs(user_id);
CREATE INDEX idx_model_logs_event ON model_logs(event);
CREATE INDEX idx_model_logs_created_at ON model_logs(created_at);
CREATE INDEX idx_translations_language_id ON translations(language_id);

-- Prevent overlapping active reservations for the same room.
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE reservations
    ADD CONSTRAINT ex_reservations_no_overlap
    EXCLUDE USING gist (
        room_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
    )
    WHERE (status_id IN (1, 2, 3));

-- Prevent overlapping active price windows for a room/pricing unit pair.
ALTER TABLE room_prices
    ADD CONSTRAINT ex_room_prices_no_overlap
    EXCLUDE USING gist (
        room_id WITH =,
        pricing_unit_id WITH =,
        daterange(effective_from, COALESCE(effective_to, 'infinity'::date), '[)') WITH &&
    )
    WHERE (status = 'ACTIVE');

-- Keep updated_at accurate for writes made outside JPA as well.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_user_location_roles_updated_at BEFORE UPDATE ON user_location_roles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_location_operating_hours_updated_at BEFORE UPDATE ON location_operating_hours FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_room_types_updated_at BEFORE UPDATE ON room_types FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_amenities_updated_at BEFORE UPDATE ON amenities FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_room_amenities_updated_at BEFORE UPDATE ON room_amenities FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_room_prices_updated_at BEFORE UPDATE ON room_prices FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reservation_amenities_updated_at BEFORE UPDATE ON reservation_amenities FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_room_blocks_updated_at BEFORE UPDATE ON room_blocks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_refresh_tokens_updated_at BEFORE UPDATE ON refresh_tokens FOR EACH ROW EXECUTE FUNCTION set_updated_at();
