import CustomException from "@/shared/exceptions/CustomException";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "@/shared/utils";

export class NoTokenException extends CustomException {
  statusCode = StatusCodes.UNAUTHORIZED;

  constructor(message: string | null = null) {
    super(message ?? 'Authentication Required');

    Object.setPrototypeOf(this, NoTokenException.prototype);
  }

  serialize(): any {
    // ✅ Use the same errorResponse helper
    return errorResponse(this.message, Number(this.statusCode));
  }
}

// export default NoTokenException;
