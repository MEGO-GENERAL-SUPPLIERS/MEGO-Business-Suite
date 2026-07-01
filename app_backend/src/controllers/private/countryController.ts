import { Request, Response } from 'express';
import { Country } from '../../models/index';

export const getCountries = async (req: Request, res: Response) => {
  const countries = await Country.findAll({
    where: { void: 0 },
    attributes: ['id', 'name', 'iso_code'],
    order: [['name', 'ASC']],
  });
  res.json({ success: true, data: countries });
};