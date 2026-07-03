import { Country } from "../models";

export const findAll = async () => {
  return Country.findAll({
    where: { void: 0 },
    attributes: ['id', 'name_common', 'iso3'],
    order: [['name_common', 'ASC']],
  });
};