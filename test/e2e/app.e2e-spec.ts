import request from "supertest"

import {App} from "../../src/app"
import {BunyanLogger} from "../../src/services/logger.service"
import {Container} from "../../src/utils/container.util"

describe("Application (e2e)", () => {
  let app: App

  beforeEach(async () => {
    const container = Container.instance()
    container.set(
      "logger",
      new BunyanLogger({
        appName: "test",
        enabled: false,
        level: "debug",
        prettyPrint: true,
      }),
    )

    app = new App(
      {
        appName: "test",
        port: 12345,
      },
      Container.instance(),
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
