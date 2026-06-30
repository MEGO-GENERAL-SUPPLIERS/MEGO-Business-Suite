import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class RolePrivilege extends Model<
  InferAttributes<RolePrivilege>,
  InferCreationAttributes<RolePrivilege>
> {
  declare id: CreationOptional<number>;
  declare void: CreationOptional<number>;
  declare role_id: number; 
  declare privilege_id: number; 
}

RolePrivilege.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    privilege_id: {
      type: DataTypes.BIGINT,
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
    tableName: 'role_privileges',
    timestamps: false,
  }
);

export default RolePrivilege;