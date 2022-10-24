import Joi from "joi"

export class NeuraAPIError extends Error {
  constructor(public status: number, public message: string) {
    super()
  }
}

export class NotFoundError extends NeuraAPIError {
  constructor(message = "Not Found") {
    super(404, message)
  }
}

export class BadRequestError extends NeuraAPIError {
  constructor(message = "Bad Request") {
    super(400, message)
  }
}

export class AccessDeniedError extends NeuraAPIError {
  constructor(message = "Access denied") {
    super(401, message)
  }
}

export class UnauthorizedError extends NeuraAPIError {
  constructor(message = "Unauthorized") {
    super(403, message)
  }
}

export class ForbiddenError extends NeuraAPIError {
  constructor(message = "Forbidden") {
    super(403, message)
  }
}

export class MethodNotAllowedError extends NeuraAPIError {
  constructor(message = "Method Not Allowed") {
    super(405, message)
  }
}

export class ConflictError extends NeuraAPIError {
  constructor(message = "Conflict") {
    super(408, message)
  }
}

export class UnSupportedMediaTypeError extends NeuraAPIError {
  constructor(message = "Unsupported Media Type") {
    super(415, message)
  }
}

export class UnProcessableEntityError extends NeuraAPIError {
  constructor(message = "Unprocessable Entity") {
    super(422, message)
  }
}

export class TooManyRequestsError extends NeuraAPIError {
  constructor(message = "Too Many Requests") {
    super(429, message)
  }
}

export class InternalServerError extends NeuraAPIError {
  constructor(message = "Internal Server Error") {
    super(500, message)
  }
}

export class ValidationRequestError extends NeuraAPIError {
  public data: {[key: string]: string[]} = {}

  constructor(message = "Validation error", errors: Joi.ValidationError) {
    super(400, message)
    errors.details.forEach(error => {
      const key = error.path.join(".")
      if (!Object.keys(this.data).includes(key)) {
        this.data[key] = []
      }

      this.data[key].push(error.message)
    })
  }
}
