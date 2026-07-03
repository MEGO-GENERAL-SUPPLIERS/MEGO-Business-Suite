import { useState } from 'react';
import { Building2, Camera, Loader2, Save } from 'lucide-react';
import { useCompanyInfo } from '../../hooks/useCompany';
import { useCountries } from '../../hooks/useCountries';
import CountrySelect from '../../components/common/CountrySelect';
import { toastSuccess, toastDanger } from '../../lib/toast';

export default function CompanyInfo() {
  const { companyInfo, loading, saving, save } = useCompanyInfo();
  const { countries, loading: countriesLoading } = useCountries();

  const [name, setName] = useState('');
  const [countryId, setCountryId] = useState<number | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  if (companyInfo && !hydrated) {
    setName(companyInfo.name);
    setCountryId(companyInfo.country_id ?? null);
    setHydrated(true);
  }

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    setIsDirty(true);
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const ok = await save({ name, country_id: countryId }, logoFile);
    if (ok) {
      toastSuccess('Company info updated', { title: 'Saved' });
      setIsDirty(false);
    } else {
      toastDanger('Something went wrong while saving.', { title: 'Save failed' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  const displayLogo = logoPreview ?? companyInfo?.logo_url ?? null;
  const selectedCountry = countries.find((c) => c.id === countryId);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid md:grid-cols-[280px_1fr] gap-6">

        {/* Live preview panel */}
        <div className="rounded-xl bg-slate-900 dark:bg-slate-800 p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden mb-4">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-8 h-8 text-white/40" />
            )}
          </div>
          <p className="text-white font-semibold text-sm">{name || 'Company Name'}</p>
          {selectedCountry && (
            <p className="text-white/50 text-xs mt-1">{selectedCountry.name_common}</p>
          )}
          <label
            htmlFor="logo-upload"
            className="mt-5 inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white border border-white/15 hover:border-white/30 rounded-full px-3 py-1.5 cursor-pointer transition-colors"
          >
            <Camera className="w-3.5 h-3.5" /> Change logo
          </label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Form panel */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
          <h1 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Edit Details</h1>

          <div className="space-y-5 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Company Name
              </label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
                placeholder="e.g. Right to Care Malawi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Country
              </label>
              <CountrySelect
                countries={countries}
                value={countryId}
                onChange={(v) => { setCountryId(v); setIsDirty(true); }}
                loading={countriesLoading}
              />
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}