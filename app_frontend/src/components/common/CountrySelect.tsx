import type { ICountry } from '../../types/ICountry';

function isoToFlagEmoji(isoCode?: string): string {
  if (!isoCode || isoCode.length !== 2) return '';
  const codePoints = isoCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

interface CountrySelectProps {
  countries: ICountry[];
  value: number | null;
  onChange: (countryId: number | null) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export default function CountrySelect({
  countries, value, onChange, loading, disabled, placeholder = 'Select a country',
}: CountrySelectProps) {
  return (
    <select
      className="form-input"
      value={value ?? ''}
      disabled={disabled || loading}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">{loading ? 'Loading…' : placeholder}</option>
      {countries.map((c) => (
        <option key={c.id} value={c.id}>
          {isoToFlagEmoji(c.iso_code)}  {c.name_common}
        </option>
      ))}
    </select>
  );
}