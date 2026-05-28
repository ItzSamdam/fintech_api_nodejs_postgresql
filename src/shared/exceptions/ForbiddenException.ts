import CustomException from "@/shared/exceptions/CustomException";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "@/shared/utils";

export class ForbiddenException extends CustomException {
  statusCode = StatusCodes.FORBIDDEN;

  constructor(message: string | null = null) {
    super(message ?? 'Unauthorized Access');

    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }

  serialize(): any {
    // ✅ Use the same errorResponse helper
    return errorResponse(this.message, Number(this.statusCode));
  }
}

// export default ForbiddenException;
