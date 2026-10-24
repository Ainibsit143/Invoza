import { useState } from "react";

import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { CURRENCIES } from "../../utils/currencies";
import { formatCurrency } from "../../utils/formatCurrency";

function Settings() {
  const { user, updateCurrency } = useAuth();

  const [currency, setCurrency] = useState(user?.currency ?? "USD");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const unchanged = currency === user?.currency;

  const handleChange = (event) => {
    setCurrency(event.target.value);
    setError("");
    setNotice("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await updateCurrency(currency);
      setNotice("Currency updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight text-[#0B1730] sm:text-3xl">
        Settings
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-base font-semibold text-[#0B1730]">Currency</h2>
        <p className="mt-1 text-sm text-slate-600">
          Prices across Invoza are shown in this currency.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {notice}
          </div>
        )}

        <div className="mt-5 space-y-2">
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-[#0B1730]"
          >
            Default currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1730] outline-none transition focus:border-[#12B8A6] focus:ring-2 focus:ring-[#12B8A6]/20"
          >
            {CURRENCIES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name} ({item.code})
              </option>
            ))}
          </select>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          Preview:{" "}
          <span className="font-semibold text-[#0B1730]">
            {formatCurrency(45000, currency)}
          </span>
        </p>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={saving || unchanged}>
            {saving ? "Saving..." : "Save currency"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Settings;