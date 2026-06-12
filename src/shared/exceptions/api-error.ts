export class ApiError extends Error {
  public response: any;

  constructor(message: string, response: any) {
    super(message);
    this.response = response;
    this.name = 'ApiError';
  }
}

export class LogicError extends Error {
  public response: any;

  constructor(message: string, response: any) {
    super(message);
    this.response = response;
    this.name = 'LogicError';
  }
}

// Custom error classes for better error handling
export class InsufficientBalanceException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientBalanceException';
  }
}

export class ValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationException';
  }
}

export class ProcessingException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProcessingException';
  }
}
