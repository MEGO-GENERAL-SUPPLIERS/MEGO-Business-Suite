import { useState } from 'react';
import { useCompanyInfo } from '../../hooks/useCompany';
import { useCountries } from '../../hooks/useCountries';
import CountrySelect from '../../components/common/CountrySelect';
import { toast } from 'react-toastify';

export default function CompanyInfo() {
  const { companyInfo, loading, saving, save } = useCompanyInfo();
  const { countries, loading: countriesLoading } = useCountries();

  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [countryId, setCountryId] = useState<number | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [hydrated, setHydrated] = useState(false);

  if (companyInfo && !hydrated) {
    setName(companyInfo.name);
    setSlogan(companyInfo.slogan ?? '');
    setCountryId(companyInfo.country_id ?? null);
    setHydrated(true);
  }

  const handleSave = async () => {
    const ok = await save(
      { name, slogan, contact_email: contactEmail, contact_phone: contactPhone, country_id: countryId },
      logoFile
    );
    if (ok) toast.success('Company info updated');
    else toast.error('Failed to save company info');
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">Company Info</h1>

      <div className="space-y-1">
        <label className="text-sm font-medium">Logo</label>
        {companyInfo?.logo_url && (
          <img src={companyInfo.logo_url} alt="Logo" className="w-16 h-16 rounded object-cover mb-2" />
        )}
        <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Company Name</label>
        <input className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Slogan</label>
        <input className="w-full border rounded px-3 py-2" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Contact Email</label>
          <input type="email" className="w-full border rounded px-3 py-2" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Contact Phone</label>
          <input className="w-full border rounded px-3 py-2" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Country</label>
        <CountrySelect countries={countries} value={countryId} onChange={setCountryId} loading={countriesLoading} />
      </div>

      <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}