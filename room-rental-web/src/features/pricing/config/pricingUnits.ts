// src/features/pricing/config/pricingUnits.ts

export interface PricingUnitOption {
  id: number;
  code: string;
  name: string;
}

export const pricingUnitOptions:
  PricingUnitOption[] = [
  /*
   * Put the IDs from your database seed here.
   *
   * Example only:
   */
  
    {
      id: 1,
      code: "HOURLY",
      name: "Hourly",
    },
   
    {
      id: 2,
      code: "DAILY",
      name: "Daily",
   },
   
];