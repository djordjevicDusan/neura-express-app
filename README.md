### Description

Basic Express application starter with some common utilities.

### Features

- Error handler - Handle application errors
- Logger - Basic Bunyan logger
- Container - Basic singleton container which can be used to set or get services and any kind of values across application
- Non-Existing route protection / middleware - Returns 404 on routes which are not registered
- API error handlers / middleware - If error is returned on next() function, it will be handled by this middleware. Besides regular API errors, can handle ValidationErrors as well
- Gracefully shutting down Express server

### Example

api.controller.ts

```
import {NeuraController} from "neura-express-app"
import express, {Request, Response} from "express"

export class ApiController extends NeuraController {
  public getRouterPrefix(): string | undefined {
    return "/api"
  }

  public getRouter(): express.Router {
    const router = express.Router()

    router.get("/", [this.index.bind(this)])

    return router
  }

  protected index(req: Request, res: Response) {
    const someValue = this.container.get<string>("some_value")
    this.logger.info(`Some value: ${someValue}`)
    res.send("Hello world")
  }
}
```

index.ts

```
import dotenv from "dotenv"

// Load env variables
dotenv.config()

// Import everything we need from NeuraApp module
import cors from "cors"
import helmet from "helmet"
import bodyParser from "body-parser"
import {
  NeuraApp,
  getAppConfig,
  NeuraContainer,
  INeuraContainer,
  BunyanLogger,
  getLoggerConfig,
  NeuraErrorHandler,
  NeuraAppError,
} from "neura-express-app"
import {ApiController} from "./controllers/api.controller"

// import modules

// Get singleton instance of Container
const container = NeuraContainer.instance()

// Instantiate logger and error handler
const logger = new BunyanLogger(getLoggerConfig())
const errorHandler = new NeuraErrorHandler(logger)

// Register logger and error handler in our container
container.set("logger", logger)
container.set("error_handler", errorHandler)
container.set("some_value", 123)

// Bootstrapping application
const bootstrap = async (container: INeuraContainer): Promise<void> => {
  // Instantiate our application
  const app = new NeuraApp(getAppConfig(), container)

  // Set callback upon error handler to gracefully close Express application either on
  // process signals or untrusted errors
  errorHandler.onClose(async () => {
    await app.close()
  })

  // Register global middlewares
  app.addMiddleware(cors())
  app.addMiddleware(helmet())

  app.addMiddleware(bodyParser.json())
  app.addMiddleware(bodyParser.urlencoded({extended: false}))

  // Register application controllers here
  // Controller have to extend NeuraController class
  app.addController(new ApiController(container))

  // Start application
  await app.listen()
}

bootstrap(NeuraContainer.instance())
  .then(() => {
    logger.info("[Application]: Started")
  })
  .catch(err => {
    errorHandler.handleError(new NeuraAppError("bootstrapping-error", err?.message, false, err))
  })
export default bootstrap
```
