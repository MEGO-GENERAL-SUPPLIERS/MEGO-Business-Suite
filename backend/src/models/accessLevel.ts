import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class AccessLevel extends Model<
  InferAttributes<AccessLevel>,
  InferCreationAttributes<AccessLevel>
> {
  declare id: CreationOptional<number>;
  declare void: CreationOptional<number>;
  declare name: string; 
}

AccessLevel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Role Access level e.g. Global'
    },
    void: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: 'access_levels',
    timestamps: false,
  }
);

export default AccessLevel;