export interface IUser{
  id: number; 
  username: string;
  enabled_2fa: boolean;
  roles: []
  person: {
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
  [key: string]: any;
};