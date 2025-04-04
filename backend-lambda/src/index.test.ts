import {describe, it, expect} from "vitest";
import {handler} from "./index";

describe("handler", () => {
    it("returns 200 response", async () => {
        const response = await handler()

        expect(response.statusCode).toBe(200)
    })
})
