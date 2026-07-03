import { Request, Response } from 'express';
import { findAll } from '../../services/countryService.js';

export const getCountries = async (req: Request, res: Response) => {
  const countries = await findAll();
  res.json({
    success: true,
    data: countries,
  });
};