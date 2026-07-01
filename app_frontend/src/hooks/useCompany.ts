import { useCallback, useEffect, useState } from 'react';
import {
  getCompanyInfo,
  updateCompanyInfo,
  uploadCompanyLogo,
  type IUpdateCompanyInfoParams,
} from '../services/companyService';
import { normalizeMessage } from '../utils/formatUtils';
import type { ICompanyInfo } from '../types/ICompanyInfo';

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState<ICompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await getCompanyInfo();
    if (response.success && response.data) {
      setCompanyInfo(response.data);
    } else {
      setError(normalizeMessage(response.message, 'Failed to load company info'));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (params: IUpdateCompanyInfoParams, logoFile?: File | null) => {
    setSaving(true);
    setError(null);
    try {
      let logoUrl = companyInfo?.logo_url;

      if (logoFile) {
        const uploadResponse = await uploadCompanyLogo(logoFile);
        if (!uploadResponse.success || !uploadResponse.data) {
          throw new Error(normalizeMessage(uploadResponse.message, 'Logo upload failed'));
        }
        logoUrl = uploadResponse.data.logo_url;
      }

      const response = await updateCompanyInfo(params);
      if (!response.success || !response.data) {
        throw new Error(normalizeMessage(response.message, 'Failed to save company info'));
      }

      setCompanyInfo({ ...response.data, logo_url: logoUrl });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save company info');
      return false;
    } finally {
      setSaving(false);
    }
  }, [companyInfo?.logo_url]);

  return { companyInfo, loading, saving, error, save, reload: load };
}