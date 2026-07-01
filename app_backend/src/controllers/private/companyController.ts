import { Request, Response } from 'express';
import { Company } from '../../models/index.js';

export const getCompanyInfo = async (req: Request, res: Response) => {
  const company = await Company.findOne({ where: { void: 0 } });
  res.json({ success: true, data: company });
};

export const updateCompanyInfo = async (req: Request, res: Response) => {
  const { name, slogan, contact_email, contact_phone, country_id } = req.body;

  const company = await Company.findOne({ where: { void: 0 } });
  if (!company) {
    return res.status(404).json({ success: false, message: 'Company info not found' });
  }

  await company.update({
    name,
    slogan,
    contact_email,
    contact_phone,
    country_id,
    updated_by: (req as any).user?.userId,
  } as any);

  res.json({ success: true, data: company });
};

export const uploadCompanyLogo = async (req: Request, res: Response) => {
  const file = (req as any).file;
  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const logoUrl = `/uploads/logos/${file.filename}`;

  const company = await Company.findOne({ where: { void: 0 } });
  if (company) {
    await company.update({ logo_url: logoUrl } as any);
  }

  res.json({ success: true, data: { logo_url: logoUrl } });
};