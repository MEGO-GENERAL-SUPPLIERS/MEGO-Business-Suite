import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class PersonContact extends Model<
  InferAttributes<PersonContact>,
  InferCreationAttributes<PersonContact>
> {
  declare id: CreationOptional<number>;
  declare void: CreationOptional<number>;
  declare person_id: CreationOptional<number>;
  declare contact_type_id: CreationOptional<number>;
  declare value: CreationOptional<string>;
  declare in_use: boolean;
  declare is_primary: boolean; 
  declare is_verified: boolean;
  declare notes: CreationOptional<string>;
}

PersonContact.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    person_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "Person Id of contact owner"
    },
    contact_type_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Contact type id of contact from contact_types table'
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Contact value e.g. email@domain.com, 265999111222'
    },
    in_use: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    void: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: 'person_contacts',
    timestamps: false,
  }
);

export default PersonContact;