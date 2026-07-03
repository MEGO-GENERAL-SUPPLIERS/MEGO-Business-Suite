import type { ICompanyInfo } from "../types/ICompanyInfo";
import { apiFetchErrorResponse } from "../utils/exceptionResponsesUtils";
import { ApiClient, type IApiResponse } from './apiClient';

const apiClient = ApiClient();

export const getCompanyInfo = async (): Promise<IApiResponse<ICompanyInfo>> => {
  try {
    const response = await apiClient.get<ICompanyInfo>("/company-info");
    return response;
  } catch (error: any) {
    return apiFetchErrorResponse<ICompanyInfo>("Failed to fetch company info", error);
  }
};


export interface IUpdateCompanyInfoParams {
  name: string;
  country_id?: number | null;
}


export const updateCompanyInfo = async (params: IUpdateCompanyInfoParams): Promise<IApiResponse<ICompanyInfo>> => {
  try {
    const response = await apiClient.put<ICompanyInfo>("/company-info", params);
    return response;
  } catch (error: any) {
    return apiFetchErrorResponse<ICompanyInfo>("Failed to update company info", error);
  }
};

export interface IUploadLogoResponse {
  logo_url: string;
}

export const uploadCompanyLogo = async (file: File): Promise<IApiResponse<IUploadLogoResponse>> => {
  try {
    const formData = new FormData();
    formData.append("logo", file);
    const response = await apiClient.post<IUploadLogoResponse>("/company-info/logo", formData);
    return response;
  } catch (error: any) {
    return apiFetchErrorResponse<IUploadLogoResponse>("Failed to upload company logo", error);
  }
};