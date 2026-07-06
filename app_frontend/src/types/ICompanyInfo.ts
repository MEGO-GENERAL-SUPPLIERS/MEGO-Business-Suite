import type { IContactType } from './IContactType';
import type { ICountry } from './ICountry';

export interface ICompany {
  id: number; 
  name: string;
  logo_url?: string | null;  
  slogan?: string | null;
  country_id?: number | null;
  country?: ICountry | null;
  tpin?: string | null;
  contacts?: ICompanyContact[];
  company?: ICompany;
};

export interface ICompanyContact {
  id?: number;
  contact_type_id: number; 
  contact_type?: IContactType | null;
  value: string;
  is_primary: boolean;
}

export interface ICompanyBranch{
  id?: number;
  name: string;
  address?: string | null;
  is_hq?: boolean;
  tpin?: string | null;
  contacts?: ICompanyContact[];
  company?: ICompany | null;
}

