INSERT INTO location_operating_hours
(
    location_id,
    day_of_week,
    open_time,
    close_time,
    closed
)
VALUES
    (1, 1, '09:00', '18:00', FALSE),
    (1, 2, '09:00', '18:00', FALSE),
    (1, 3, '09:00', '18:00', FALSE),
    (1, 4, '09:00', '18:00', FALSE),
    (1, 5, '09:00', '18:00', FALSE),
    (1, 6, '09:00', '13:00', FALSE),
    (1, 7, NULL, NULL, TRUE);