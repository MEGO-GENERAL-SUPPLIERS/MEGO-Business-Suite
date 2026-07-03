import type { ICountry } from '../types/ICountry';
import { apiFetchErrorResponse } from '../utils/exceptionResponsesUtils';
import { ApiClient, type IApiResponse } from './apiClient';

const apiClient = ApiClient();

/**
 * Get Countries
 */
export const getCountries = async (): Promise<IApiResponse<ICountry[]>> => {
  try {
    const response = await apiClient.get<ICountry[]>("/countries");
    return response;
  } catch (error: any) {
    return apiFetchErrorResponse<ICountry[]>("Failed to fetch countries", error);
  }
};