import {render, screen} from "@testing-library/react";
import App from "./App.tsx";

describe("app", () => {

    test("renders", () => {
        render(<App/>)

        expect(screen.getByText("Vite + React")).toBeInTheDocument()
    })

})
