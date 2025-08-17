export function getDeliveryEstimate(shippingDays: number) {
  // Get EST time
  const dateEstStr = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });

  // EST Date Object
  const date = new Date(dateEstStr);

  // If past 2 P.M. add 1 day to shipping date
  if (date.getHours() > 14) {
    shippingDays += 1;
  }

  const result = new Date();

  let shippingDaysAdded = 0;

  while (shippingDaysAdded < shippingDays) {
    result.setDate(result.getDate() + 1);

    const day = result.getDay();

    if (day !== 0) {
      shippingDaysAdded++;
    }
  }

  return result
    .toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .split(",")
    .join("")
    .toLowerCase();
}
