import http from "http"
import cors from "cors"
import helmet from "helmet"
import bodyParser from "body-parser"
import express, {Request, Response, NextFunction} from "express"
import {createHttpTerminator, HttpTerminator} from "http-terminator"
import {IAppConfig} from "./config/app.config"
import {AppError} from "./errors/app.error"
import {APIError, NotFoundError, ValidationRequestError} from "./errors/api.error"
import {ILogger} from "./services/logger.service"
import {IContainer} from "./utils/container.util"
import {BaseController} from "./controllers/base.controller"

export type ControllerConstructor<T> = {new (...args: any[]): T}

export class App {
  protected app: express.Application
  protected httpServer: http.Server
  protected httpTerminator: HttpTerminator
  protected started = false
  protected logger: ILogger
  protected controllers: BaseController[]

  constructor(protected readonly config: IAppConfig, protected readonly container: IContainer) {
    this.app = express()
    this.httpServer = new http.Server(this.app)
    this.controllers = []

    const logger = container.get<ILogger>("logger")
    if (!logger) {
      throw new AppError("logger-not-defined", "Can't find logger in container!", false)
    }
    this.logger = logger

    this.httpTerminator = createHttpTerminator({
      server: this.httpServer,
    })
  }

  public get HttpServer(): http.Server {
    return this.httpServer
  }

  public registerController<T extends BaseController>(controller: ControllerConstructor<T>): void {
    this.controllers.push(new controller(this.container))
  }

  public listen(): Promise<void> {
    // Make sure application was not already started
    if (this.started) {
      throw new AppError("app-started-multiple-times", "Application was already started", false)
    }

    // Add cors middleware & headers
    this.app.use(cors())
    // Add all bunch of security headers
    this.app.use(helmet())

    // @TODO: Add rate limiter middleware here

    // Parse body
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({extended: false}))

    // Register routes
    for (const controller of this.controllers) {
      this.app.use(controller.getRoutes())
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
      if (error instanceof APIError) {
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
          this.logger.info(`⚡️[HttpServer]: Closed`)
        })

        this.logger.info(`⚡️[HttpServer]: Listening at http://localhost:${this.config.port}`)
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
