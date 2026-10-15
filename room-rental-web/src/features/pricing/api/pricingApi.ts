import { coreApi } from "../../../lib/axios";

export interface PriceCalculationRequest {
  roomId: number;
  pricingUnitId: number;
  startAt: string;
  endAt: string;
}
export interface PriceCalculationResult {
  pricingUnit: {
    id: number;
    code: string;
    name: string;
  };

  unitPrice: number;

  totalAmount: number;

  currencyCode: string;
}

export const pricingApi = {
  calculate: async (
    request: PriceCalculationRequest,
  ): Promise<PriceCalculationResult> => {
    const response =
      await coreApi.post<PriceCalculationResult>(
        "/v1/pricing/calculate",
        request,
      );

    return response.data;
  },
};