export class DatabaseError extends Error {
  constructor(message = "A database error occurred.") {
    super(message);
    this.name = "DatabaseError";
  }
}

export class AuthError extends Error {
  constructor(message = "User is not authenticated.") {
    super(message);
    this.name = "AuthError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "The requested resource was not found.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message = "The provided data was invalid.") {
    super(message);
    this.name = "ValidationError";
  }
}
