### Description

Basic Express application starter with some common utilities.

### Features

- Error handler - Handle application errors
- Logger - Basic Bunyan logger
- Container - Basic singleton container which can be used to set or get services and any kind of values across application
- Non-Existing route protection / middleware - Returns 404 on routes which are not registered
- API error handlers / middleware - If error is returned on next() function, it will be handled by this middleware. Besides regular API errors, can handle ValidationErrors as well
- Gracefully shutting down Express server

### Example

```
// Load env variables
dotenv.config()

// import modules

// Get singleton instance of Container
const container = NeuraContainer.instance()

// Instantiate logger and error handler
const logger = new BunyanLogger(getLoggerConfig())
const errorHandler = new NeuraErrorHandler(logger)

// Register logger and error handler in our container
container.set("logger", logger)
container.set("error_handler", errorHandler)

// Bootstrapping application
const bootstrap = async (container: IContainer): Promise<void> => {
  // Instantiate our application
  const app = new NeuraApp(getAppConfig(), container)

  // Set callback upon error handler to gracefully close Express application either on
  // process signals or untrusted errors
  errorHandler.onClose(async () => {
    await app.close()
  })

  // Register application controllers here
  // Controller have to extend BaseController class
  // app.registerController(SomeController)

  // Start application
  await app.listen()
}

bootstrap(NeuraContainer.instance())
  .then(() => {
    logger.info("[Application]: Started")
  })
  .catch(err => {
    errorHandler.handleError(new AppError("bootstrapping-error", err?.message, false, err))
  })
export default bootstrap
```
