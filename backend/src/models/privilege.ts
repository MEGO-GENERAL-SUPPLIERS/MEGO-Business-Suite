import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class Privilege extends Model<
  InferAttributes<Privilege>,
  InferCreationAttributes<Privilege>
> {
  declare id: CreationOptional<number>;
  declare void: CreationOptional<number>;
  declare name: string; 
  declare action_name: string; 
  declare parent_id: number; 
}

Privilege.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Privilege name e.g. Manage Clients Section'
    },
    action_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Privilege action names e.g. can_add_client, can_edit_client, can_void_client'
    },
    parent_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    void: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'privileges',
    timestamps: false,
  }
);

export default Privilege;