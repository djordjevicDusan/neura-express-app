import {ILogger} from "../services/logger.service"

export interface IContainer {
  set(serviceName: string, service: any): void
  get<T>(serviceName: string): T | undefined
}

export class Container implements IContainer {
  protected static _instance: Container

  protected logger?: ILogger
  protected services = new Map<string, any>()

  private constructor() {
    //
  }

  public static instance(): IContainer {
    if (Container._instance) {
      return Container._instance
    }
    Container._instance = new Container()
    return Container._instance
  }

  public set(serviceName: string, service: any): void {
    if (!this.logger) {
      this.logger = this.get("logger")
    }

    if (this.services.has(serviceName)) {
      this.logger?.warn(`Container: Container property '${serviceName}' was already defined, it will be overwritten!`)
    }
    this.services.set(serviceName, service)
    this.logger?.info(`Container: New property registered: '${serviceName}' of type ${typeof service}`)
  }

  public get<T>(serviceName: string): T | undefined {
    if (!this.services.has(serviceName)) {
      return undefined
    }
    return this.services.get(serviceName) as T
  }
}
