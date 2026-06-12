import CustomException from "@/shared/exceptions/custom-exception";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "@/shared/utils";

/**
 * Represents an exception that occurs when a bad request is made.
 */
export class ServerException extends CustomException {
  public statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, ServerException.prototype);
  }

  /**
   * Serializes the exception into an error message object.
   * @returns The serialized error message object.
   */
  serialize(): any {
    // ✅ Use the same errorResponse helper
    return errorResponse(this.message, Number(this.statusCode));
  }
}

// export default ConflictException;
