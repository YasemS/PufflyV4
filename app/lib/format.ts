function currency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function plural(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export default {
  currency,
  plural,
};
