import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';
import Company from './company.js';

export class CompanyBranch extends Model<
  InferAttributes<CompanyBranch>,
  InferCreationAttributes<CompanyBranch>
> {
  declare id: CreationOptional<number>;
  declare void: CreationOptional<number>;
  declare company_id: number;
  declare name: string;
  declare address: CreationOptional<string>;
  declare phone: CreationOptional<string>;
  declare email: CreationOptional<string>;

  declare company?: Company;
}

CompanyBranch.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'company', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    void: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'company_branches',
    timestamps: false,
  }
);


export default CompanyBranch;