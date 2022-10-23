import Bunyan from "bunyan"
import BunyanFormat from "bunyan-format"

import {ILoggerConfig} from "../config/logger.config"

/**
 * Basic interface for loggers
 */
export interface ILogger {
  debug: (msg: string, ...args: unknown[]) => void
  info: (msg: string, ...args: unknown[]) => void
  warn: (msg: string, ...args: unknown[]) => void
  error: (msg: string, ...args: unknown[]) => void
}

/**
 * Wrapper class for Bunyan logger.
 */
export class BunyanLogger implements ILogger {
  protected static instance?: BunyanLogger
  protected underlyingLogger?: Bunyan

  constructor(protected config: ILoggerConfig) {
    if (!config.enabled) {
      return
    }

    const stream = config.prettyPrint
      ? new BunyanFormat({
          color: true,
          outputMode: "long",
        })
      : process.stdout

    this.underlyingLogger = Bunyan.createLogger({
      name: config.appName,
      level: config.level as Bunyan.LogLevel,
      stream,
    })
  }

  public verbos(msg: string, ...args: unknown[]): void {
    this.underlyingLogger?.debug(msg, ...args)
  }

  public debug(msg: string, ...args: unknown[]): void {
    this.underlyingLogger?.debug(msg, ...args)
  }

  public info(msg: string, ...args: unknown[]): void {
    this.underlyingLogger?.info(msg, ...args)
  }

  public warn(msg: string, ...args: unknown[]): void {
    this.underlyingLogger?.warn(msg, ...args)
  }

  public error(msg: string, ...args: unknown[]): void {
    this.underlyingLogger?.error(msg, ...args)
  }
}
