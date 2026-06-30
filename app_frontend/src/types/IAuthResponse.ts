import { type IUser } from "./IUser";

export interface IAuthResponse extends IUser {
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}