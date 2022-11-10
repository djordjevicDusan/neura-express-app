import http from "http"
import express, {Request, Response, NextFunction, RequestHandler} from "express"
import {createHttpTerminator, HttpTerminator} from "http-terminator"
import {INeuraAppConfig} from "./config/app.config"
import {NeuraAppError} from "./errors/app.error"
import {NeuraAPIError, NotFoundError, ValidationRequestError} from "./errors/api.error"
import {INeuraLogger} from "./utils/logger.util"
import {INeuraContainer} from "./utils/container.util"
import {NeuraController} from "./controllers/neura.controller"

export class NeuraApp {
  protected app: express.Application
  protected httpServer: http.Server
  protected httpTerminator: HttpTerminator
  protected started = false
  protected logger: INeuraLogger

  constructor(protected readonly config: INeuraAppConfig, protected readonly container: INeuraContainer) {
    this.app = express()
    this.httpServer = new http.Server(this.app)

    const logger = container.get<INeuraLogger>("logger")
    if (!logger) {
      throw new NeuraAppError("logger-not-defined", "Can't find logger in container!", false)
    }
    this.logger = logger

    this.httpTerminator = createHttpTerminator({
      server: this.httpServer,
    })

    if (this.config.logHttpRequests) {
      this.app.use((req: Request, _res: Response, next: NextFunction) => {
        this.logger.info(`[App]: New request`, {
          method: req.method,
          url: req.url,
          body: req.body,
          query: req.query,
        })
        next()
      })
    }
  }

  public get HttpServer(): http.Server {
    return this.httpServer
  }

  public addController<T extends NeuraController>(instance: T): void {
    const routePrefix = instance.getRouterPrefix()
    const router = instance.getRouter()
    const constructorName = (instance as any)?.constructor?.name

    if (routePrefix) {
      this.app.use(routePrefix, router)
      this.logger.debug(`[App]: Controller added: ${constructorName} on base url: ${routePrefix}`)
      return
    }
    this.logger.debug(`[App]: Controller added: ${constructorName}`)
    this.app.use(router)
  }

  public addMiddleware(handler: RequestHandler) {
    this.logger.debug(`[App]: Middleware added: ${handler.name}`)
    this.app.use(handler)
  }

  public listen(): Promise<void> {
    // Make sure application was not already started
    if (this.started) {
      throw new NeuraAppError("app-started-multiple-times", "Application was already started", false)
    }

    // If route was not found, handle it
    this.app.use((req: Request, _res: Response) => {
      throw new NotFoundError(`HTTP Not found: ${req.method} on ${req.url}`)
    })

    // If error was thrown, handle it
    this.app.use((error: any, req: Request, res: Response, _next: NextFunction) => {
      this.logger.warn("ErrorMiddleware: API error occurs", error)

      // Handle validation errors
      if (error instanceof ValidationRequestError) {
        return res.status(error.status).send({
          code: error.status,
          error: error.message,
          data: error.data,
        })
      }

      // Handle other API errors
      if (error instanceof NeuraAPIError) {
        return res.status(error.status).send({
          code: error.status,
          error: error.message,
        })
      }

      // Unknown error, return 500
      return res.status(500).send({
        code: 500,
        message: "Something went wrong!",
      })
    })

    return new Promise<void>((res, _rej) => {
      this.httpServer.listen(this.config.port, () => {
        this.started = true

        this.httpServer.on("close", () => {
          this.logger.info(`[HttpServer]: Closed`)
        })

        this.logger.info(`[HttpServer]: Listening at http://localhost:${this.config.port}`)
        res()
      })
    })
  }

  public async close(): Promise<void> {
    if (this.started) {
      // HttpTerminator will terminate all pending connections
      await this.httpTerminator.terminate()
    }
    this.logger.info("[Application]: Closed")
  }
}
