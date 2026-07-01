import type { ICountry } from './ICountry';

export interface ICompanyInfo {
  id: number; 
  name: string;
  logo_url?: string | null;  
  slogan?: string | null;
  country_id?: number | null;
  country?: ICountry | null;
};