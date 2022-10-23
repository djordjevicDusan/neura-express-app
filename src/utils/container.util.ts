import {INeuraLogger} from "./logger.util"

export interface INeuraContainer {
  set(serviceName: string, service: any): void
  get<T>(serviceName: string): T | undefined
}

export class NeuraContainer implements INeuraContainer {
  protected static _instance: NeuraContainer

  protected logger?: INeuraLogger
  protected services = new Map<string, any>()

  private constructor() {
    //
  }

  public static instance(): INeuraContainer {
    if (NeuraContainer._instance) {
      return NeuraContainer._instance
    }
    NeuraContainer._instance = new NeuraContainer()
    return NeuraContainer._instance
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
