import {render, screen, waitFor} from "@testing-library/react";
import App from "./App.tsx";
import {beforeEach, expect} from "vitest";

describe("app", () => {

    const todoItems = [
        {id:'id123', text:'text123'},
        {id:'id456', text:'text456'},
    ]

    beforeEach(() => {
        const response = {
            ok: true,
            json: () => Promise.resolve(todoItems)
        }
        global.fetch = vi.fn().mockResolvedValue(response)
    })
    
    test("renders", async () => {
        render(<App/>)

        expect(await screen.findByText("TODO")).toBeInTheDocument()
    })

    test("send request", async () => {
        render(<App/>)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/todo/')
        })
        expect(screen.getByText(todoItems[0].text)).toBeInTheDocument()
        expect(screen.getByText(todoItems[1].text)).toBeInTheDocument()
    })
})
