import type { ICompany, ICompanyBranch } from './ICompanyInfo';

export interface IUser{
  id?: number; 
  username?: string;
  enabled_2fa?: boolean;
  roles?: [];
  person?: {
    id?: number; 
    firstname: string; 
    lastname: string;
    othernames?: string; 
    gender: {
      id: number; 
      name: string;
    },
    person_contacts: [] | null,
    person_identifications: [] | null
  };
  company?: ICompany | null;
  branch?: ICompanyBranch | null;
  refresh_token?: string | null;
  token_type?: string | null;
  expires_in?: number | null;
  [key: string]: any;
};