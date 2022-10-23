import {IRouter} from "express"
import {ILogger} from "../services/logger.service"
import {IContainer} from "../utils/container.util"

export abstract class BaseController {
  protected logger: ILogger

  constructor(container: IContainer) {
    this.logger = container.getLogger()
  }

  public abstract getRoutes(): IRouter
}
