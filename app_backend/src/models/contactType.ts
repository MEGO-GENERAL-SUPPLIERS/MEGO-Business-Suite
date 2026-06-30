import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class ContactType extends Model<
  InferAttributes<ContactType>,
  InferCreationAttributes<ContactType>
> {
  declare id: number;
  declare void: CreationOptional<number>;
  declare name: string;
}

ContactType.init(
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
    void: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'contact_types',
    timestamps: false,
  }
);

export default ContactType;