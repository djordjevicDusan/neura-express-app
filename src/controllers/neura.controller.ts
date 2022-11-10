import express, {Request, Response, NextFunction, Router, RequestHandler, IRouter} from "express"
import {NeuraAppError} from "../errors/app.error"
import {INeuraLogger} from "../utils/logger.util"
import {INeuraContainer} from "../utils/container.util"
import {ClassConstructor} from "class-transformer"
import {validateData} from "../other/helpers"
import {ValidationRequestError} from "../errors/api.error"

export class NeuraRouter {
  public router: Router
  protected logger: INeuraLogger

  constructor(protected readonly container: INeuraContainer) {
    const logger = container.get<INeuraLogger>("logger")
    if (!logger) {
      throw new NeuraAppError("app-logger-missing", "Application logger not defined!", false)
    }
    this.logger = logger
    this.router = express.Router()
  }

  public use(...handlers: Array<RequestHandler>): void {
    this.router.use(handlers)
  }

  public get<T, U>(
    path: string,
    cb: (body: T, query: U) => Promise<any>,
    bodyToValidate?: ClassConstructor<T>,
    queryToValidate?: ClassConstructor<U>,
  ): void {
    this.logger.info(`Route [GET]: ${path} registered`)
    this.router.get(path, async (req: Request, res: Response, next: NextFunction) => {
      await this.validateBodyAndRespond(req, res, next, cb, bodyToValidate, queryToValidate)
    })
  }

  public post<T, U>(
    path: string,
    cb: (body: T, query: U) => Promise<any>,
    bodyToValidate?: ClassConstructor<T>,
    queryToValidate?: ClassConstructor<U>,
  ): void {
    this.logger.info(`Route [POST]: ${path} registered`)
    this.router.post(path, async (req: Request, res: Response, next: NextFunction) => {
      await this.validateBodyAndRespond(req, res, next, cb, bodyToValidate, queryToValidate)
    })
  }

  public put<T, U>(
    path: string,
    cb: (body: T, query: U) => Promise<any>,
    bodyToValidate?: ClassConstructor<T>,
    queryToValidate?: ClassConstructor<U>,
  ): void {
    this.logger.info(`Route [PUT]: ${path} registered`)
    this.router.put(path, async (req: Request, res: Response, next: NextFunction) => {
      await this.validateBodyAndRespond(req, res, next, cb, bodyToValidate, queryToValidate)
    })
  }

  public delete<T, U>(
    path: string,
    cb: (body: T, query: U) => Promise<any>,
    bodyToValidate?: ClassConstructor<T>,
    queryToValidate?: ClassConstructor<U>,
  ): void {
    this.logger.info(`Route [DELETE]: ${path} registered`)
    this.router.delete(path, async (req: Request, res: Response, next: NextFunction) => {
      await this.validateBodyAndRespond(req, res, next, cb, bodyToValidate, queryToValidate)
    })
  }

  protected async validateBodyAndRespond<T, U>(
    req: Request,
    res: Response,
    next: NextFunction,
    cb: (body: T, query: U) => Promise<any>,
    bodyToValidate?: ClassConstructor<T>,
    queryToValidate?: ClassConstructor<U>,
  ): Promise<any> {
    if (bodyToValidate) {
      const validationErrors = await validateData(bodyToValidate, req.body)
      if (validationErrors instanceof ValidationRequestError) {
        return next(validationErrors)
      }
    }
    if (queryToValidate) {
      const validationErrors = await validateData(queryToValidate, req.query)
      if (validationErrors instanceof ValidationRequestError) {
        return next(validationErrors)
      }
    }
    const result = await cb(req.body as T, req.query as U)
    return res.send(result ?? "Ok")
  }
}

export abstract class NeuraController {
  protected logger: INeuraLogger
  protected router: NeuraRouter
  private routesRegistered = false

  constructor(protected readonly container: INeuraContainer) {
    const logger = container.get<INeuraLogger>("logger")
    if (!logger) {
      throw new NeuraAppError("app-logger-missing", "Application logger not defined!", false)
    }
    this.logger = logger
    this.router = new NeuraRouter(container)
  }

  public getRouterPrefix(): string | undefined {
    return undefined
  }

  public abstract registerRoutes(): void

  public getRouter(): IRouter {
    if (!this.routesRegistered) {
      this.registerRoutes()
      this.routesRegistered = true
    }

    return this.router.router
  }
}
