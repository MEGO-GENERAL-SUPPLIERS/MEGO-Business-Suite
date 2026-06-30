import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class ClientType extends Model<
  InferAttributes<ClientType>,
  InferCreationAttributes<ClientType>
> {
  declare id: CreationOptional<number>;
  declare void: CreationOptional<number>;
  declare name: string;
}

ClientType.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Client type name e.g. Institution, Shop, Other'
    },
    void: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: 'client_types',
    timestamps: false,
  }
);

export default ClientType;