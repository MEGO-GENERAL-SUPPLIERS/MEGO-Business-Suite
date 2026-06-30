import type { IAuthResponse } from "../types/IAuthResponse";
import { apiFetchErrorResponse } from "../utils/exceptionResponsesUtils";
import { ApiClient, type IApiResponse } from './apiClient';

const apiClient = ApiClient();

/**
 * Authenticate User
 */
export interface IAuthParams{
  username: string;
  password: string;
};

export const authenticateUser = async (params: IAuthParams): Promise<IApiResponse<any>> => {
  try{
    const response = await apiClient.post<IAuthResponse>("/auth/login", params);
    return response;
  } catch(error: any){
    return apiFetchErrorResponse<IApiResponse>("Failed to authenticate user", error);
  }
};


/**
 * Password Reset
 */