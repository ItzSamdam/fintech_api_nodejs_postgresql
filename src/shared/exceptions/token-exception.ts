import CustomException from "@/shared/exceptions/custom-exception";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "@/shared/utils";

export class TokenException extends CustomException {
  statusCode = StatusCodes.UNAUTHORIZED;

  constructor(message: string | null = null) {
    super(message ?? 'Oops! Invalid or Expired Token!');

    Object.setPrototypeOf(this, TokenException.prototype);
  }

  serialize(): any {
    // ✅ Use the same errorResponse helper
    return errorResponse(this.message, Number(this.statusCode));
  }
}

// export default TokenException;
