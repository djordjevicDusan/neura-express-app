export interface INeuraAppConfig {
  appName: string
  port: number
  logHttpRequests: boolean
  bodyParserEnabled: boolean
}

export const getAppConfig = (): INeuraAppConfig => ({
  appName: process.env.APP_NAME ?? "neura-express-app",
  logHttpRequests: process.env.LOG_HTTP_REQUESTS ? process.env.LOG_HTTP_REQUESTS === "true" : true,
  port: Number(process.env.APP_PORT ?? "3000"),
  bodyParserEnabled: process.env.APP_BODY_PARSER_ENABLED ? process.env.APP_BODY_PARSER_ENABLED === "true" : true,
})
