import axios from "axios";

type Headers = Record<string, string>;

// use this in all external api calls
export const HttpRequest = async (
  endPoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  payload: any,
  headers: Headers,
  params?: Record<string, any>, // optional query parameters
): Promise<any> => {
  try {
    return await axios({
      method,
      url: endPoint,
      data: payload,
      headers,
      params,
    });
  } catch (error) {
    return error;
  }
};
