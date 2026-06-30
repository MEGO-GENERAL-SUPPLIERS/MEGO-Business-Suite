import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class PersonIdentification extends Model<
  InferAttributes<PersonIdentification>,
  InferCreationAttributes<PersonIdentification>
> {
  declare id: CreationOptional<number>;
  declare void: CreationOptional<number>;
  declare person_id: CreationOptional<number>;
  declare identification_type_id: CreationOptional<number>;
  declare identifier: CreationOptional<number>;
  declare country_code: CreationOptional<string>;
  declare issue_date: CreationOptional<DataTypes.DateOnlyDataType>;
  declare expiry_date: CreationOptional<DataTypes.DateDataType>;
  declare is_primary: CreationOptional<boolean>;
  declare is_verified: CreationOptional<boolean>;
}

PersonIdentification.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    person_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Person id from person table'
    },
    identification_type_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'identification type id from identification_types table'
    },
    identifier: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Person\'s ID number'
    },
    country_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Country code like MW, ZA for IDs like passports'
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    void: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: 'person_identifications',
    timestamps: false,
  }
);

export default PersonIdentification;