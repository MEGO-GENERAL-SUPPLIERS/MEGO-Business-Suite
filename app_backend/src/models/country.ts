import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class Country extends Model<
  InferAttributes<Country>,
  InferCreationAttributes<Country>
> {
  declare id: number;
  declare name_common: CreationOptional<string>;
  declare currency_code: CreationOptional<string>;
  declare curreny_name: CreationOptional<string>;
  declare void: CreationOptional<number>;
}

Country.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name_common: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    currency_code: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    curreny_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    void: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: 'countries',
    timestamps: false,
    hooks: {}
  }
);

export default Country;