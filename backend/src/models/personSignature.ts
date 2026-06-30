import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class PersonSignature extends Model<
  InferAttributes<PersonSignature>,
  InferCreationAttributes<PersonSignature>
> {
  declare id: CreationOptional<number>;
  declare void: CreationOptional<number>;
  declare person_id: CreationOptional<number>;
  declare signature_image_url: CreationOptional<string>;
  declare signatory_title: CreationOptional<string>;
}

PersonSignature.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    person_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    signature_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    signatory_title: {
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
    tableName: 'person_signatures',
    timestamps: false,
  }
);

export default PersonSignature;