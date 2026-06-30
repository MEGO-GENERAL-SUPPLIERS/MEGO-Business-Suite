import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class Person extends Model<
  InferAttributes<Person>,
  InferCreationAttributes<Person>
> {
  declare id: CreationOptional<number>;
  declare void: CreationOptional<number>;
  declare first_name: string; 
  declare last_name: string; 
  declare other_names: CreationOptional<string>;
  declare gender_id: number; 
  declare date_of_birth: CreationOptional<DataTypes.DateOnlyDataType>;
}

Person.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Person first official/given name'
    },
    last_name: {
      type: DataTypes.STRING(255),
      allowNull:  false,
      comment: 'Person last/family name'
    },
    other_names: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Other legal person names or initials'
    },
    gender_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Gender ID from `gender` table',
      defaultValue: 3
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Legal of birth of person'
    },
    void: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: 'person',
    timestamps: false,
  }
);

export default Person;