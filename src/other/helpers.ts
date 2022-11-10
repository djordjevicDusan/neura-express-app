import {validate as classValidate} from "class-validator"
import {plainToClass} from "class-transformer"
import {ValidationRequestError} from "../errors/api.error"
import {ClassConstructor} from "class-transformer"

export const validateData = async <T>(
  constructor: ClassConstructor<T>,
  body: any,
): Promise<T | ValidationRequestError> => {
  const data = plainToClass(constructor, body)
  const validationErrors = await classValidate(data as any)

  if (validationErrors.length > 0) {
    return new ValidationRequestError("Invalid input", validationErrors)
  }

  return data as T
}
