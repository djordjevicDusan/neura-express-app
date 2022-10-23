import request from "supertest"

import {NeuraApp} from "../../src/app"
import {BunyanLogger} from "../../src/utils/logger.util"
import {NeuraContainer} from "../../src/utils/container.util"

describe("Application (e2e)", () => {
  let app: NeuraApp

  beforeEach(async () => {
    const container = NeuraContainer.instance()
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
})
