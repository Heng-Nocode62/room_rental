import { api } from "../../../lib/axios";

import type {
  OperatingHoursRequest,
  OperatingHoursResponse,
} from "../types/operatingHours";

export const operatingHoursApi = {
  async getByLocation(locationId: number): Promise<OperatingHoursResponse[]> {
    const response = await api.get<OperatingHoursResponse[]>(
      `/locations/${locationId}/operating-hours`
    );

    return response.data;
  },

  async upsert(
    locationId: number,
    dayOfWeek: number,
    request: OperatingHoursRequest
  ): Promise<OperatingHoursResponse> {
    const response = await api.put<OperatingHoursResponse>(
      `/locations/${locationId}/operating-hours/${dayOfWeek}`,
      request
    );

    return response.data;
  },

  async delete(locationId: number, dayOfWeek: number): Promise<void> {
    await api.delete(
      `/locations/${locationId}/operating-hours/${dayOfWeek}`
    );
  },
};
