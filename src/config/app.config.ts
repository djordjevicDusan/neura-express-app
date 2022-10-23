export interface INeuraAppConfig {
  appName: string
  port: number
}

export const getAppConfig = (): INeuraAppConfig => ({
  appName: process.env.APP_NAME ?? "neura-express-app",
  port: Number(process.env.APP_PORT ?? "3000"),
})
