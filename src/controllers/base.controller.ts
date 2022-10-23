import {IRouter} from "express"
import {NeuraAppError} from "../errors/app.error"
import {INeuraLogger} from "../utils/logger.util"
import {INeuraContainer} from "../utils/container.util"

export abstract class NeuraBaseController {
  protected logger: INeuraLogger

  constructor(container: INeuraContainer) {
    const logger = container.get<INeuraLogger>("logger")
    if (!logger) {
      throw new NeuraAppError("app-logger-missing", "Application logger not defined!", false)
    }
    this.logger = logger
  }

  public abstract getRoutes(): IRouter
}
