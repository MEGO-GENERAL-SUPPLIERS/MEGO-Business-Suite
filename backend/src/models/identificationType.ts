import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class IdentificationType extends Model<
  InferAttributes<IdentificationType>,
  InferCreationAttributes<IdentificationType>
> {
  declare id: number;
  declare void: CreationOptional<number>;
  declare name: string; 
  declare alias_name: CreationOptional<string>;
  declare usable_after_expiration: boolean;
}

IdentificationType.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name:{
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Identification types e.g. Driver\'s license, National ID'
    },
    alias_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'identification type alias e.g. NID, DL'
    },
    usable_after_expiration: {
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
    tableName: 'identification_types',
    timestamps: false,
  }
);

export default IdentificationType;