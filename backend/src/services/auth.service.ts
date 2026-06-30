// src/services/auth.service.ts
import { User, Person, Gender, AccessLevel, Role, Privilege } from '../models/index.js';
import { JwtService, JwtPayload } from './jwt.service.js';
import bcrypt from 'bcryptjs';
import consola from 'consola';

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: number;
    username: string;
    access_level: {
      id: number;
      name: string;
      description: string | null;
    };
    roles: Array<{
      id: number;
      name: string;
      description: string | null;
      is_primary: boolean;
    }>;
    privileges: Array<{
      id: number;
      name: string;
      action_name: string;
      source: 'role' | 'user';
    }>;
    person: {
      id: number;
      first_name: string;
      last_name: string;
      other_names: string | null;
      date_of_birth: string | null;
      gender: {
        id: number;
        name: string;
        alias_name: string;
      } | null;
      last_login: string | null;
    } | null; // Keep null if business logic allows users without persons
    is_active: boolean;
    is_verified: boolean;
    enabled_2fa: boolean;
  };
}

export class AuthService {
  static async login(username: string, password: string): Promise<LoginResponse> {
    const user = await User.findOne({
      where: {
        username,
        is_active: true,
        void: 0
      },
      include: [
        {
          model: Person,
          as: 'person',
          required: true, 
          include: [{
            model: Gender,
            as: 'gender',
            attributes: ['id', 'name', 'alias_name']
          }],
          attributes: { exclude: ['void', 'created_at', 'updated_at'] }
        },
        {
          model: AccessLevel,
          as: 'access_level',
          required: true,
          attributes: ['id', 'name'] // 'description'] 
        },
        {
          model: Role,
          as: 'roles',
          through: { attributes: ['is_primary'] },
          attributes: ['id', 'name'] // 'description']
        },
        {
          model: Privilege,
          as: 'privileges',
          through: { attributes: [] },
          attributes: ['id', 'name', 'action_name']
        }
      ],
      attributes: {
        exclude: ['void', 'created_at', 'updated_at'] 
      }
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Safety check for password existence
    if (!user.password) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (user?.person) {
      await user.person.update({ last_login: new Date() } as any);
    }

    const tokenPayload: Omit<JwtPayload, 'sessionId'> = {
      userId: user.id,
      username: user.username
    };
    
    const token = JwtService.generateAccessToken(tokenPayload);
    const refreshToken = JwtService.generateRefreshToken(tokenPayload);

    return {
      token,
      refreshToken,
      user: this.formatUserResponse(user)
    };
  }

  private static formatUserResponse(user: any): LoginResponse['user'] {
    const roles = user.roles.map((r: any) => {
      const userRole = (user.getDataValue('user_roles') || []).find(
        (ur: any) => ur.role_id === r.id
      );
      return {
        id: r.id,
        name: r.name,
        description: r.description,
        is_primary: userRole?.is_primary === 1
      };
    });

    // ✅ FIXED: Deduplication Logic
    // 1. Get IDs of Direct User Privileges
    const directPrivilegeIds = new Set(
      user.privileges?.map((p: any) => p.id) || []
    );

    // 2. Map Direct Privileges
    const directPrivileges = (user.privileges || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      action_name: p.action_name,
      source: 'user' as const
    }));

    // 3. Map Role Privileges, excluding those already granted directly
    const rolePrivileges = user.roles.flatMap((r: any) => 
      (r.privileges || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        action_name: p.action_name,
        source: 'role' as const
      }))
    ).filter((p: any) => !directPrivilegeIds.has(p.id)); // ✅ Check against Direct IDs

    return {
      id: user.id,
      username: user.username,
      access_level: {
        id: user.access_level.id,
        name: user.access_level.name,
        description: user.access_level.description
      },
      roles,
      privileges: [...directPrivileges, ...rolePrivileges],
      person: user.person ? {
        id: user.person.id,
        first_name: user.person.first_name,
        last_name: user.person.last_name,
        other_names: user.person.other_names,
        date_of_birth: user.person.date_of_birth 
          ? new Date(user.person.date_of_birth).toISOString().split('T')[0] 
          : null,
        gender: user.person.gender ? {
          id: user.person.gender.id,
          name: user.person.gender.name,
          alias_name: user.person.gender.alias_name
        } : null,
        last_login: user.person.last_login 
          ? new Date(user.person.last_login).toISOString() 
          : new Date().toISOString()
      } : null,
      is_active: user.is_active,
      is_verified: user.is_verified,
      enabled_2fa: user.enabled_2fa
    };
  }
}