import * as dotenv from "dotenv"

dotenv.config()

import {App} from "./app"
import {getAppConfig} from "./config/app.config"
import {getLoggerConfig} from "./config/logger.config"
import {AppError} from "./errors/app.error"
import {ErrorHandler} from "./services/error-handler.service"
import {BunyanLogger} from "./services/logger.service"
import {Container, IContainer} from "./utils/container.util"

const container = Container.instance()
const logger = new BunyanLogger(getLoggerConfig())
const errorHandler = new ErrorHandler(logger)

container.set("logger", logger)
container.set("error_handler", errorHandler)

const bootstrap = async (container: IContainer): Promise<void> => {
  const app = new App(getAppConfig(), container)

  errorHandler.onClose(async () => {
    await app.close()
  })

  await app.listen()
}

bootstrap(Container.instance())
  .then(() => {
    logger.info("[Application]: Started")
  })
  .catch(err => {
    errorHandler.handleError(new AppError("bootstrapping-error", err?.message, false, err))
  })
export default bootstrap
