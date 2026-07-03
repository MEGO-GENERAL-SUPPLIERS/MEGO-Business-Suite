import { Request, Response } from 'express';
import { findCompany, saveCompany, uploadCompanyLogo} from '../../services/companyService';

export const get = async (req: Request, res: Response) => {
  const company = await findCompany();
  res.json({ success: true, data: company });
};


export const update = async (req: Request, res: Response) => {
  const { name, country_id } = req.body;

  const company = await saveCompany({ name, country_id });
  if (!company) {
    return res.status(404).json({ success: false, message: 'Company info not found' });
  }

  res.json({ success: true, data: company });
};


export const uploadCompany = async (req: Request, res: Response) => {
  const file = (req as any).file;
  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const logoUrl = `/uploads/logos/${file.filename}`;
  await uploadCompanyLogo(logoUrl);
  res.json({ success: true, data: { logo_url: logoUrl } });
};