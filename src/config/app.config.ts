export interface IAppConfig {
  appName: string
  port: number
}

export const getAppConfig = (): IAppConfig => ({
  appName: process.env.APP_NAME ?? "url-shortener",
  port: Number(process.env.APP_PORT ?? "3020"),
})
