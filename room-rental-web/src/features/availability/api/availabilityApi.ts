
import { api } from "../../../lib/axios";

import type {
  DayAvailabilityOverviewResponse,
  DayAvailabilityResponse,
  MonthlyAvailabilityResponse,
} from "../types/availability";

interface DayAvailabilityParams {
  roomId: number;
  date: string;
}

interface MonthAvailabilityParams {
  roomId: number;
  year: number;
  month: number;
}

export const availabilityApi = {

  async getDay(
    params: DayAvailabilityParams
  ): Promise<DayAvailabilityResponse> {

    const response =
      await api.get<DayAvailabilityResponse>(
        "/availability/day",
        {
          params: {
            roomId: params.roomId,
            date: params.date,
          },
        }
      );

    return response.data;
  },
  async getDayOverview(
    date:string,
    roomTypeId?:number,
    locationId?:number
  ): Promise<DayAvailabilityOverviewResponse>{
    const response = await api.get(
      "/availability/day/overview",{
        params:{
          date,
          roomTypeId,
          locationId
        }
      }
    );
    return response.data;
  },
  async getMonth(
    params: MonthAvailabilityParams,
  ): Promise<MonthlyAvailabilityResponse> {
    const response =
      await api.get<MonthlyAvailabilityResponse>(
        "/availability/month",
        {
          params: {
            roomId: params.roomId,
            year: params.year,
            month: params.month,
          },
        },
      );

    return response.data;
  },
};