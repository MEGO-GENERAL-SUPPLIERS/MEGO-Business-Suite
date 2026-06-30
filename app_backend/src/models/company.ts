import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';
import type CompanyBranch from './companyBranch.js';

export class Company extends Model<
  InferAttributes<Company>,
  InferCreationAttributes<Company>
> {
  declare id: number;
  declare void: CreationOptional<number>;
  declare name: string; 
  declare logo_url: CreationOptional<string>;
  declare country_id: CreationOptional<number>;

  declare branches?: CompanyBranch[];
}

Company.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    void: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Company legal name"
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Company logo url"
    },
    country_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'country company using the admin dashboard reside'
    }
  },
  {
    sequelize,
    tableName: 'companies',
    timestamps: false,
  }
);

export default Company;