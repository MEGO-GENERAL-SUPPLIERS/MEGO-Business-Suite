import type { ICompanyInfo } from "../types/ICompanyInfo";
import { apiFetchErrorResponse } from "../utils/exceptionResponsesUtils";
import { ApiClient, type IApiResponse } from './apiClient';

const apiClient = ApiClient();

/**
 * Get Company Info
 */
export const getCompanyInfo = async (): Promise<IApiResponse<ICompanyInfo>> => {
  try {
    const response = await apiClient.get<ICompanyInfo>("/app/company-info");
    return response;
  } catch (error: any) {
    return apiFetchErrorResponse<ICompanyInfo>("Failed to fetch company info", error);
  }
};

/**
 * Update Company Info
 */
export interface IUpdateCompanyInfoParams {
  name: string;
  slogan?: string;
  contact_email?: string;
  contact_phone?: string;
  country_id?: number | null;
}

export const updateCompanyInfo = async (
  params: IUpdateCompanyInfoParams
): Promise<IApiResponse<ICompanyInfo>> => {
  try {
    const response = await apiClient.put<ICompanyInfo>("/app/company-info", params);
    return response;
  } catch (error: any) {
    return apiFetchErrorResponse<ICompanyInfo>("Failed to update company info", error);
  }
};

/**
 * Upload Company Logo
 */
export interface IUploadLogoResponse {
  logo_url: string;
}

export const uploadCompanyLogo = async (file: File): Promise<IApiResponse<IUploadLogoResponse>> => {
  try {
    const formData = new FormData();
    formData.append("logo", file);

    // ASSUMPTION: ApiClient exposes a multipart-aware method (postForm) that
    // skips JSON.stringify + the "Content-Type: application/json" header, so
    // the browser sets the correct multipart boundary itself. If ApiClient
    // currently only has get/post/put for JSON bodies, paste apiClient.ts and
    // I'll add the method for you.
    const response = await apiClient.post<IUploadLogoResponse>("/app/company-info/logo", formData);
    return response;
  } catch (error: any) {
    return apiFetchErrorResponse<IUploadLogoResponse>("Failed to upload company logo", error);
  }
};