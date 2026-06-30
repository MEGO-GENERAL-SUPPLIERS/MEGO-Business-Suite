import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class Gender extends Model<
  InferAttributes<Gender>,
  InferCreationAttributes<Gender>
> {
  declare id: number;
  declare void: CreationOptional<number>;
  declare name: string; 
  declare alias_name: string; 
}

Gender.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    alias_name: {
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
    tableName: 'gender',
    timestamps: false,
  }
);

export default Gender;