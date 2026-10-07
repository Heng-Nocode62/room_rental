import { Input, Select } from "../../../components/ui";

import type { AmenityResponse, RoomStatus } from "../types/room";

interface Option {
  id: number;
  name: string;
}

interface Props {
  keyword: string;
  locationId: string;
  roomTypeId: string;
  status: RoomStatus | "";
  minCapacity: string;
  maxCapacity: string;
  amenityId: string;
  locations: Option[];
  roomTypes: Option[];
  amenities: AmenityResponse[];
  amenitiesDisabled?: boolean;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRoomTypeChange: (value: string) => void;
  onStatusChange: (value: RoomStatus | "") => void;
  onMinCapacityChange: (value: string) => void;
  onMaxCapacityChange: (value: string) => void;
  onAmenityChange: (value: string) => void;
}

export function RoomFilters({
  keyword,
  locationId,
  roomTypeId,
  status,
  minCapacity,
  maxCapacity,
  amenityId,
  locations,
  roomTypes,
  amenities,
  amenitiesDisabled = false,
  onKeywordChange,
  onLocationChange,
  onRoomTypeChange,
  onStatusChange,
  onMinCapacityChange,
  onMaxCapacityChange,
  onAmenityChange,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Input
        label="Search"
        placeholder="Room number or name..."
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
      />

      <Select
        label="Location"
        value={locationId}
        onChange={(event) => onLocationChange(event.target.value)}
        options={[
          { value: "", label: "All locations" },
          ...locations.map((location) => ({
            value: String(location.id),
            label: location.name,
          })),
        ]}
      />

      <Select
        label="Room type"
        value={roomTypeId}
        onChange={(event) => onRoomTypeChange(event.target.value)}
        options={[
          { value: "", label: "All room types" },
          ...roomTypes.map((type) => ({
            value: String(type.id),
            label: type.name,
          })),
        ]}
      />

      <Select
        label="Status"
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as RoomStatus | "")
        }
        options={[
          { value: "", label: "All statuses" },
          { value: "ACTIVE", label: "Active" },
          { value: "INACTIVE", label: "Inactive" },
          { value: "MAINTENANCE", label: "Maintenance" },
        ]}
      />

      <Input
        label="Minimum capacity"
        type="number"
        min={1}
        value={minCapacity}
        onChange={(event) => onMinCapacityChange(event.target.value)}
      />

      <Input
        label="Maximum capacity"
        type="number"
        min={1}
        value={maxCapacity}
        onChange={(event) => onMaxCapacityChange(event.target.value)}
      />

      <Select
        label="Amenity"
        value={amenityId}
        disabled={amenitiesDisabled}
        onChange={(event) => onAmenityChange(event.target.value)}
        options={[
          {
            value: "",
            label: amenitiesDisabled
              ? "Select a location first"
              : "All amenities",
          },
          ...amenities.map((amenity) => ({
            value: String(amenity.id),
            label: `${amenity.name} · ${amenity.price.toFixed(2)}`,
          })),
        ]}
      />
    </div>
  );
}
