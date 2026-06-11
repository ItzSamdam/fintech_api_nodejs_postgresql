import CustomException from "@/shared/exceptions/custom-exception";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "@/shared/utils";

export class NotFoundException extends CustomException {
  statusCode = StatusCodes.NOT_FOUND;

  constructor(message: string | null = null) {
    super(message ?? 'Resource / Route Not found');

    Object.setPrototypeOf(this, NotFoundException.prototype);
  }

  serialize(): any {
    // ✅ Use the same errorResponse helper
    return errorResponse(this.message, Number(this.statusCode));
  }
}

// export default NotFoundException;
