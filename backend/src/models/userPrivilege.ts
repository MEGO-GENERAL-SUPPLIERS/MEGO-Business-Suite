import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class UserPrivilege extends Model<
  InferAttributes<UserPrivilege>,
  InferCreationAttributes<UserPrivilege>
> {
  declare id: CreationOptional<number>;
  declare void: CreationOptional<number>;
  declare user_id: number;
  declare privilege_id: number;
}

UserPrivilege.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
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
    tableName: 'user_privileges',
    timestamps: false,
  }
);

export default UserPrivilege;