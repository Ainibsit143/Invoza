import { useEffect, useState } from "react";

import Button from "../ui/Button";
import BusinessForm from "./BusinessForm";
import { profileService } from "../../services/profile";

function BusinessProfile() {
  const [business, setBusiness] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadBusiness() {
      try {
        const data = await profileService.getBusiness();

        if (!ignore) {
          setBusiness(data);
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error.message);
        }
      }
    }

    loadBusiness();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setLoadError("");
    setReloadKey((key) => key + 1);
  };

  const loading = !business && !loadError;

  return (
    <section className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[#0B1730]">
        Business profile
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        These details appear as &quot;From&quot; on your invoices.
      </p>

      <div className="mt-5">
        {loading && (
          <div
            role="status"
            className="flex items-center justify-center gap-3 py-10 text-sm text-slate-600"
          >
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#12B8A6]"
            />
            Loading...
          </div>
        )}

        {loadError && (
          <div
            role="alert"
            className="flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center"
          >
            <p className="text-sm text-red-700">{loadError}</p>
            <Button variant="secondary" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        )}

        {business && (
          <BusinessForm
            business={business}
            onSubmit={profileService.updateBusiness}
          />
        )}
      </div>
    </section>
  );
}

export default BusinessProfile;