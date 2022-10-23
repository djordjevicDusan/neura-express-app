import {ValidationError} from "class-validator"

export class APIError extends Error {
  constructor(public status: number, public message: string) {
    super()
  }
}

export class NotFoundError extends APIError {
  constructor(message = "Not Found") {
    super(404, message)
  }
}

export class ValidationRequestError extends APIError {
  public data: {[key: string]: string[]} = {}

  constructor(message = "Validation error", errors: ValidationError[]) {
    super(400, message)
    errors.forEach(error => {
      this.data[error.property] = error.constraints !== undefined ? Object.values(error.constraints) : []
    })
  }
}
