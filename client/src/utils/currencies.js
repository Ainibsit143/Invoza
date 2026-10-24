// Same exclusions as the backend: these codes are not real money
const EXCLUDED = new Set(["XXX", "XTS"]);

const displayNames = new Intl.DisplayNames(["en"], { type: "currency" });

// [{ code: "PKR", name: "Pakistani Rupee" }, ...] sorted by name
export const CURRENCIES = Intl.supportedValuesOf("currency")
  .filter((code) => !EXCLUDED.has(code))
  .map((code) => ({ code, name: displayNames.of(code) ?? code }))
  .sort((a, b) => a.name.localeCompare(b.name));