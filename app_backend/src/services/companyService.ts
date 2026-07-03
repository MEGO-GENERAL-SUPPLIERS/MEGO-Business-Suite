import { Company } from "../models";

export interface UpdateCompanyInfoParams {
  name: string;
  country_id?: number | null;
}


export const findCompany = async() => {
  return Company.findOne({ where: { void: 0 } });
};


export const saveCompany = async (input: UpdateCompanyInfoParams) => {
  const company = await findCompany();
  if(!company)  return null

  await company.update({
    name: input.name,
    country_id: input.country_id,
  } as any);

  return company;
};


export const uploadCompanyLogo = async (logo_url: string) => {
  const company = await findCompany();
  if(company) await company.update({ logo_url: logo_url } as any);

  return logo_url;
};