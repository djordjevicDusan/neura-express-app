import Joi from "joi"
import {Request, Response, NextFunction} from "express"
import {ValidationRequestError} from "../errors/api.error"

export const validateBodyMiddleware = (schema: Joi.Schema) => {
  return function (req: Request, _res: Response, next: NextFunction) {
    const results = schema.validate(req.body)
    if (!results.error) {
      return next()
    }
    return next(new ValidationRequestError("Body validation error", results.error))
  }
}

export const validateQueryMiddleware = (schema: Joi.Schema) => {
  return function (req: Request, _res: Response, next: NextFunction) {
    const results = schema.validate(req.query)
    if (!results.error) {
      return next()
    }
    return next(new ValidationRequestError("Query validation error", results.error))
  }
}

export const validateParamsMiddleware = (schema: Joi.Schema) => {
  return function (req: Request, _res: Response, next: NextFunction) {
    const results = schema.validate(req.params)
    if (!results.error) {
      return next()
    }
    return next(new ValidationRequestError("Params validation error", results.error))
  }
}
