import util from "util"

import {AppError} from "../errors/app.error"
import {ILogger} from "./logger.service"

/**
 * Basic interface for Application error handling
 */
export interface IErrorHandler {
  onClose: (cb: () => Promise<void>) => void
  handleError: (error: unknown) => void
}

export class ErrorHandler implements IErrorHandler {
  protected onCloseCb?: () => Promise<void>

  constructor(protected readonly logger: ILogger) {
    this.listenNativeEvents()
  }

  public onClose(cb: () => Promise<void>): void {
    this.onCloseCb = cb
  }

  public async handleError(error: unknown) {
    try {
      const appError = this.normalizeError(error)
      this.logger.error(`ErrorHandler: Application error`, appError)

      if (!appError.isTrusted) {
        await this.closeApp()
      }
    } catch (handlingError: unknown) {
      process.stderr.write(`Failed to handle error properly!`)
      process.stderr.write(JSON.stringify(error))
      process.stderr.write(JSON.stringify(handlingError))
    }
  }

  protected listenNativeEvents(): void {
    process.on("uncaughtException", async error => {
      await this.handleError(error)
    })
    process.on("unhandledRejection", async error => {
      await this.handleError(error)
    })
    process.on("SIGTERM", async () => {
      this.logger.info(`SIGTERM signal received, trying to close app gracefully!`)
      await this.closeApp()
    })
    process.on("SIGINT", async () => {
      this.logger.info(`SIGINT signal received, trying to close app gracefully!`)
      await this.closeApp()
    })
  }

  protected async closeApp(): Promise<void> {
    try {
      if (this.onCloseCb) {
        await this.onCloseCb()
      }
      process.exit(0)
    } catch (err) {
      this.logger.error("ErrorHandler: Error while exiting process", err)
      process.exit(1)
    }
  }

  protected normalizeError(errorToHandle: unknown): AppError {
    if (errorToHandle instanceof AppError) {
      return errorToHandle
    }

    if (errorToHandle instanceof Error) {
      const appError = new AppError(errorToHandle.name, errorToHandle.message, false, errorToHandle?.stack)
      appError.stack = errorToHandle.stack
      return appError
    }

    const inputType = typeof errorToHandle
    return new AppError(
      "unknown-error",
      `Error handler receives an error of type - ${inputType}, value ${util.inspect(errorToHandle)}`,
    )
  }
}
