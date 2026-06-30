import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';
import Person from './person.js';
import AccessLevel from './accessLevel.js';
import Role from './role.js';
import Privilege from './privilege.js';
import bcrypt from 'bcryptjs';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare void: CreationOptional<number>;
  declare username: CreationOptional<string>;
  declare password: CreationOptional<string>;
  declare person_id: CreationOptional<number>;
  declare access_level_id: CreationOptional<number>;
  declare is_active: boolean;
  declare is_verified: boolean;
  declare enabled_2fa: boolean; 

  declare person?: Person;
  declare access_level?: AccessLevel;
  declare roles?: Role[];
  declare privileges?: Privilege[];

  // Instance method to verify password
  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Instance method to hash password before save
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    person_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    access_level_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 1
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    enabled_2fa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    void: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await User.hashPassword(user.password);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await User.hashPassword(user.password);
        }
      },
    }
  }
);

export default User;