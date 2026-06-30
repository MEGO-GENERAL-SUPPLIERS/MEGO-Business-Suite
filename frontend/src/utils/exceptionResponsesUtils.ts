import type { IApiResponse } from "../services/apiClient";

export const apiFetchErrorResponse = <T = any>(
  message: string | string[] = "An API call error occured",
  error?: unknown
): IApiResponse<T> => {
  const messageArray = Array.isArray(message) ? message : [message];

  let debugMessage = "";
  if(error){
    if(error instanceof Error){
      debugMessage = error.message;
    } else if(typeof error === "string"){
      debugMessage = error; 
    } else if(typeof error === "object" && error != null){
      debugMessage = JSON.stringify(error);
    }
  }

  return {
    success: false,
    message: debugMessage,
    metadata: {
      timestamp: new Date().toISOString(),
      debug: debugMessage || undefined
    }
  };
};