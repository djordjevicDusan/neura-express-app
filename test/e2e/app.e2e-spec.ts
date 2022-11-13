import request from "supertest"
import {IsNotEmpty, IsDefined, IsString, IsNumber} from "class-validator"

import {NeuraApp} from "../../src/app"
import {BunyanLogger} from "../../src/utils/logger.util"
import {NeuraContainer} from "../../src/utils/container.util"
import {NeuraController, NeuraRequest} from "../../src/controllers/neura.controller"

class TestDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  username!: string

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password!: string

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  someNumber!: number
}

class TestDTOQuery {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  username!: string

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password!: string
}

class TestController extends NeuraController {
  public registerRoutes(): void {
    this.router.post(
      "/testBody",
      async (request: NeuraRequest<TestDTO, undefined>) => {
        return "Ok"
      },
      TestDTO,
    )
    this.router.get(
      "/testquery",
      async (request: NeuraRequest<undefined, TestDTOQuery>) => {
        return "Ok"
      },
      undefined,
      TestDTOQuery,
    )
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
        bodyParserEnabled: true,
      },
      NeuraContainer.instance(),
    )

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
        error: "Invalid input",
        data: {
          username: [
            "username should not be null or undefined",
            "username must be a string",
            "username should not be empty",
          ],
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

    it("Route returns validation error when query is not correct", async () => {
      const response = await request(app.HttpServer).get("/testquery")
      expect(response.statusCode).toBe(400)
      expect(response.body).toMatchObject({
        code: 400,
        error: "Invalid input",
        data: {
          username: [
            "username should not be null or undefined",
            "username must be a string",
            "username should not be empty",
          ],
        },
      })
    })
    it("Route returns 200 when query data is correct", async () => {
      const response = await request(app.HttpServer).get("/testquery?username=something&password=something")
      expect(response.statusCode).toBe(200)
    })
  })
})
