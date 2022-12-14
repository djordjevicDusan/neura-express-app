import express, {Request, Response, NextFunction, Router, RequestHandler, IRouter} from "express"
import {NeuraAppError} from "../errors/app.error"
import {INeuraLogger} from "../utils/logger.util"
import {INeuraContainer} from "../utils/container.util"
import {ClassConstructor} from "class-transformer"
import {validateData} from "../other/helpers"
import {ValidationRequestError} from "../errors/api.error"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NeuraSession {}

export interface NeuraRequest<T, U> {
  body: T
  query: U
  session: NeuraSession
  headers: {[key: string]: string}
  expressRequest: Request
  expressResponse: Response
  cookies: {[key: string]: string}
}

export class NeuraRouter {
  public router: Router
  public routePrefix: string | undefined
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
    cb: (request: NeuraRequest<T, U>) => Promise<any>,
    bodyToValidate?: ClassConstructor<T>,
    queryToValidate?: ClassConstructor<U>,
  ): void {
    this.logger.info(`[Router]: New route [GET] -> ${this.getFullRoutePath(path)}`)
    this.router.get(path, async (req: Request, res: Response, next: NextFunction) => {
      await this.validateAndRespond(req, res, next, cb, bodyToValidate, queryToValidate)
    })
  }

  public post<T, U>(
    path: string,
    cb: (request: NeuraRequest<T, U>) => Promise<any>,
    bodyToValidate?: ClassConstructor<T>,
    queryToValidate?: ClassConstructor<U>,
  ): void {
    this.logger.info(`[Router]: New route [POST] -> ${this.getFullRoutePath(path)}`)
    this.router.post(path, async (req: Request, res: Response, next: NextFunction) => {
      await this.validateAndRespond(req, res, next, cb, bodyToValidate, queryToValidate)
    })
  }

  public put<T, U>(
    path: string,
    cb: (request: NeuraRequest<T, U>) => Promise<any>,
    bodyToValidate?: ClassConstructor<T>,
    queryToValidate?: ClassConstructor<U>,
  ): void {
    this.logger.info(`[Router]: New route [PUT] -> ${this.getFullRoutePath(path)}`)
    this.router.put(path, async (req: Request, res: Response, next: NextFunction) => {
      await this.validateAndRespond(req, res, next, cb, bodyToValidate, queryToValidate)
    })
  }

  public delete<T, U>(
    path: string,
    cb: (request: NeuraRequest<T, U>) => Promise<any>,
    bodyToValidate?: ClassConstructor<T>,
    queryToValidate?: ClassConstructor<U>,
  ): void {
    this.logger.info(`[Router]: New route [DELETE] -> ${this.getFullRoutePath(path)}`)
    this.router.delete(path, async (req: Request, res: Response, next: NextFunction) => {
      await this.validateAndRespond(req, res, next, cb, bodyToValidate, queryToValidate)
    })
  }

  protected async validateAndRespond<T, U>(
    req: Request,
    res: Response,
    next: NextFunction,
    cb: (request: NeuraRequest<T, U>) => Promise<any>,
    bodyToValidate?: ClassConstructor<T>,
    queryToValidate?: ClassConstructor<U>,
  ): Promise<any> {
    try {
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
      const result = await cb({
        body: req.body as T,
        query: req.query as U,
        headers: req.headers as {[key: string]: string},
        session: (req as any).session ?? {},
        expressRequest: req,
        expressResponse: res,
        cookies: req.cookies as {[key: string]: string},
      })
      return res.send(result ?? "Ok")
    } catch (error: any) {
      return next(error)
    }
  }

  protected getFullRoutePath(path: string): string {
    return this.routePrefix ? `${this.routePrefix}${path}` : path
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
      this.router.routePrefix = this.getRouterPrefix()
      this.registerRoutes()
      this.routesRegistered = true
    }

    return this.router.router
  }
}
