export interface ApiResponse<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
    error?: any;
}

export const successResponse = <T>(
    data: T,
    message = "Request successful",
    statusCode = 200
): ApiResponse<T> => ({
    success: true,
    statusCode,
    message,
    data,
});

export const errorResponse = (
    message = "An error occurred",
    statusCode = 500,
    error?: any
): ApiResponse => ({
    success: false,
    statusCode,
    message,
    error,
});
