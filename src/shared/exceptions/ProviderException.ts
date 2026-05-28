import CustomException from "@/shared/exceptions/CustomException";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "@/shared/utils";

export class ProviderException extends CustomException {
  public statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  constructor(message: string | null = null) {
    super(message ?? 'Provider Cannot be Reached. Please try again later.');

    Object.setPrototypeOf(this, ProviderException.prototype);
  }

  serialize(): any {
    // ✅ Use the same errorResponse helper
    return errorResponse(this.message, Number(this.statusCode));
  }
}

// export default ProviderException;
