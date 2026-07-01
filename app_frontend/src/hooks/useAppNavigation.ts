import { useCallback } from 'react';
import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { ROUTE_MAP } from '../data/menuData';

/**
 * Navigate using either a menu id (e.g. "company-info") or a raw path
 * (e.g. "/settings/company-info"). If the string matches a known menu id,
 * it's resolved via ROUTE_MAP; otherwise it's treated as a literal path.
 */
export function useAppNavigation() {
  const navigate = useNavigate();

  const goTo = useCallback(
    (idOrPath: string, options?: NavigateOptions) => {
      const path = ROUTE_MAP[idOrPath] ?? idOrPath;
      navigate(path, options);
    },
    [navigate]
  );

  const goBack = useCallback(() => navigate(-1), [navigate]);

  return { navigateTo: goTo, goBack };
}