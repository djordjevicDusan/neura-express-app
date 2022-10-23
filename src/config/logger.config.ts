export interface INeuraLoggerConfig {
  level: string
  enabled: boolean
  prettyPrint: boolean
  appName: string
}

export const getLoggerConfig = (): INeuraLoggerConfig => ({
  enabled: process.env.LOG_ENABLED ? process.env.LOG_ENABLED === "true" : true,
  level: process.env.LOG_LEVEL ?? "info",
  appName: process.env.APP_NAME ?? "neura-express-app",
  prettyPrint: process.env.LOG_PRETTY ? process.env.LOG_PRETTY === "true" : true,
})
