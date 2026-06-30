import { sequelize } from '../config/database.js';

// All Models
import AccessLevel from './accessLevel.js';
import ClientType from './clientType.js';
import Company from './company.js';
import ContactType from './contactType.js';
import Country from './country.js';
import Gender from './gender.js';
import IdentificationType from './identificationType.js';
import Person from './person.js';
import PersonContact from './personContact.js';
import PersonIdentification from './personIdentification.js';
import PersonSignature from './personSignature';
import Privilege from './privilege.js';
import Role from './role.js';
import RolePrivilege from './rolePrivilege.js';
import User from './user.js';
import UserPrivilege from './userPrivilege.js';
import UserRole from './userRole.js';
import CompanyBranch from './companyBranch.js';

// Associations
Gender.hasMany(Person, { foreignKey: 'gender_id', as: 'person' });
Person.belongsTo(Gender, { foreignKey: 'gender_id', as: 'gender' });

AccessLevel.hasMany(User, { foreignKey: 'access_level_id', as: 'users' });
User.belongsTo(AccessLevel, { foreignKey: 'access_level_id', as: 'access_level' });

Person.hasMany(User, { foreignKey: 'person_id', as: 'users' });
User.belongsTo(Person, {foreignKey: 'person_id', as: 'person' });

ContactType.hasMany(PersonContact, { foreignKey: 'contact_type_id', as: 'person_contacts' });
PersonContact.belongsTo(ContactType, { foreignKey: 'contact_type_id', as: 'contact_types' });

Person.hasMany(PersonContact, { foreignKey: 'person_id', as: 'person_contacts' });
PersonContact.belongsTo(Person, { foreignKey: 'person_id', as: 'person' });

IdentificationType.hasMany(PersonIdentification, { foreignKey: 'identification_type_id', as: 'person_identifications' });
PersonIdentification.belongsTo(IdentificationType, { foreignKey: 'identification_type_id', as: 'identification_types' });

Person.hasMany(PersonIdentification, { foreignKey: 'person_id', as: 'person_identifications' });
PersonIdentification.belongsTo(Person, { foreignKey: 'person_id', as: 'person' });

Person.hasMany(PersonSignature, { foreignKey: 'person_id', as: 'person_signatures' });
PersonSignature.belongsTo(Person, { foreignKey: 'person_id', as: 'person' });

Country.hasMany(Company, { foreignKey: 'country_id', as: 'companies' });
Company.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });

Company.hasMany(CompanyBranch, { foreignKey: 'company_id', as: 'branches' });
CompanyBranch.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

CompanyBranch.hasMany(User, { foreignKey: 'company_branch_id', as: 'users' });
User.belongsTo(CompanyBranch, { foreignKey: 'company_branch_id', as: 'branch' });

Role.belongsToMany(User, {
  through: UserRole,
  as: 'users',
  foreignKey: 'role_id',
  otherKey: 'user_id'
});

User.belongsToMany(Role, {
  through: UserRole,
  as: 'roles',
  foreignKey: 'user_id',
  otherKey: 'role_id'
});

Privilege.belongsToMany(Role, {
  through: RolePrivilege,
  as: 'roles',
  foreignKey: 'privilege_id',
  otherKey: 'role_id'
});
Role.belongsToMany(Privilege, { 
  through: RolePrivilege, 
  as: 'privileges',
  foreignKey: 'role_id',
  otherKey: 'privilege_id'
});

Privilege.belongsToMany(User, { 
  through: UserPrivilege, 
  as: 'users',
  foreignKey: 'privilege_id',
  otherKey: 'user_id'
});
User.belongsToMany(Privilege, { 
  through: UserPrivilege, 
  as: 'privileges',
  foreignKey: 'user_id',
  otherKey: 'privilege_id'
});

// Export everything
export {
  sequelize,
  AccessLevel,
  ClientType,
  Company,
  ContactType,
  Country,
  Gender,
  IdentificationType,
  Person,
  PersonContact,
  PersonIdentification,
  PersonSignature,
  Privilege,
  Role,
  RolePrivilege,
  User,
  UserPrivilege,
  UserRole,
  CompanyBranch
};