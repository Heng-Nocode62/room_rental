export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  const responseMessage = (
    error as { response?: { data?: { message?: string } } } | undefined
  )?.response?.data?.message;

  return (
    responseMessage || (error as { message?: string } | undefined)?.message || fallback
  );
}

export interface PriceLike {
  price: number;
  currencyCode: string;
  pricingUnitCode: string;
}

export function formatPrice(price: PriceLike) {
  const amount = Number(price.price).toFixed(2);

  return price.currencyCode === "USD"
    ? `$${amount}`
    : `${amount} ${price.currencyCode}`;
}

export function priceUnitLabel(code: string) {
  if (code === "HOURLY") return "hour";
  if (code === "DAILY") return "day";
  return null;
}

export function formatMoney(value: number) {
  return Number(value).toFixed(2);
}