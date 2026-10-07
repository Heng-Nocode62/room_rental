import { useMutation } from "@tanstack/react-query";

import {
  pricingApi,
  type PriceCalculationRequest,
} from "../api/pricingApi";

export function useCalculatePrice() {
  return useMutation({
    mutationFn: (
      request: PriceCalculationRequest,
    ) => pricingApi.calculate(request),
  });
}