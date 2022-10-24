import {NeuraApp} from "./app"
import {getAppConfig, INeuraAppConfig} from "./config/app.config"
import {getLoggerConfig, INeuraLoggerConfig} from "./config/logger.config"
import {NeuraBaseController} from "./controllers/base.controller"
import {
  AccessDeniedError,
  NeuraAPIError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  UnProcessableEntityError,
  UnSupportedMediaTypeError,
  ValidationRequestError,
} from "./errors/api.error"
import {NeuraAppError} from "./errors/app.error"
import {NeuraErrorHandler, INeuraErrorHandler} from "./utils/error-handler.util"
import {BunyanLogger, INeuraLogger} from "./utils/logger.util"
import {NeuraContainer, INeuraContainer} from "./utils/container.util"
import {validateMiddleware} from "./middleware/validate.middleware"

export {
  NeuraApp,
  NeuraContainer,
  NeuraErrorHandler,
  NeuraAppError,
  INeuraContainer,
  INeuraErrorHandler,
  BunyanLogger,
  INeuraLogger as INeuraLogger,
  NeuraAPIError as APIError,
  NotFoundError,
  BadRequestError,
  AccessDeniedError,
  UnauthorizedError,
  ForbiddenError,
  MethodNotAllowedError,
  ConflictError,
  UnSupportedMediaTypeError,
  UnProcessableEntityError,
  TooManyRequestsError,
  InternalServerError,
  ValidationRequestError,
  NeuraBaseController,
  INeuraAppConfig,
  getAppConfig,
  INeuraLoggerConfig,
  getLoggerConfig,
  validateMiddleware,
}

export default NeuraApp
