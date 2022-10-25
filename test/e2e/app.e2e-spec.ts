import request from "supertest"
import Joi from "joi"
import express, {Request, Response} from "express"
import bodyParser from "express"

import {NeuraApp} from "../../src/app"
import {BunyanLogger} from "../../src/utils/logger.util"
import {NeuraContainer} from "../../src/utils/container.util"
import {NeuraController} from "../../src/controllers/base.controller"
import {validateBodyMiddleware} from "../../src/middleware/validate.middleware"
import {IRouter} from "express"

class TestController extends NeuraController {
  public getRouter(): IRouter {
    const router = express.Router()

    const testBodySchema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      someNumber: Joi.number().required(),
    })

    router.post("/testBody", validateBodyMiddleware(testBodySchema), (_req: Request, res: Response) => {
      res.send("ok")
    })

    return router
  }
}

describe("Application (e2e)", () => {
  let app: NeuraApp
  const container = NeuraContainer.instance()

  beforeEach(async () => {
    container.set(
      "logger",
      new BunyanLogger({
        appName: "test",
        enabled: false,
        level: "debug",
        prettyPrint: true,
      }),
    )

    app = new NeuraApp(
      {
        appName: "test",
        port: 12345,
        logHttpRequests: false,
      },
      NeuraContainer.instance(),
    )

    app.addMiddleware(bodyParser.json())
    app.addMiddleware(bodyParser.urlencoded({extended: false}))

    app.addController(new TestController(container))
    await app.listen()
  })

  afterEach(async () => {
    await app.close()
  })

  describe("Non Existing routes", () => {
    it("Non existing route returns 404", async () => {
      const response = await request(app.HttpServer).get("/non-existing-url-123")

      expect(response.statusCode).toBe(404)
      expect(response.body).toMatchObject({
        code: 404,
      })
    })
  })

  describe("Route Validation errors", () => {
    it("Route returns validation error when body data is not correct", async () => {
      const response = await request(app.HttpServer).post("/testBody")
      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        code: 400,
        error: "Body validation error",
        data: {
          username: ['"username" is required'],
        },
      })
    })
    it("Route returns 200 when body data is correct", async () => {
      const response = await request(app.HttpServer).post("/testBody").send({
        username: "something",
        password: "something",
        someNumber: 123,
      })
      expect(response.statusCode).toBe(200)
    })
  })
})
