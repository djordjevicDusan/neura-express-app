import Joi from "joi"
import {Request, Response, NextFunction} from "express"
import {ValidationRequestError} from "../errors/api.error"

export const validateMiddleware = (schema: Joi.Schema) => {
  return function (req: Request, _res: Response, next: NextFunction) {
    const results = schema.validate(req)
    if (!results.error) {
      return next()
    }
    return next(new ValidationRequestError("Validation error", results.error))
  }
}
