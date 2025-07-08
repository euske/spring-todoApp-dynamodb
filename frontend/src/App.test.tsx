import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, expect } from "vitest";
import App from "./App.tsx";

describe("App", () => {
	const todoItems = [
		{ id: "id123", text: "text123" },
		{ id: "id456", text: "text456" },
	];

	beforeEach(() => {
		const response = {
			ok: true,
			json: () => Promise.resolve(todoItems),
		};
		global.fetch = vi.fn().mockResolvedValue(response);
	});

	test("タイトルを表示する。", async () => {
		render(<App />);

		expect(await screen.findByText("TODO")).toBeInTheDocument();
	});

	test("バックエンドを呼び、返された全項目を表示する。", async () => {
		render(<App />);

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith("/api/todo");
		});
		expect(screen.getByText(todoItems[0].text)).toBeInTheDocument();
		expect(screen.getByText(todoItems[1].text)).toBeInTheDocument();
	});

	test("入力フォームを表示する。", async () => {
		render(<App />);

		expect(await screen.findByRole("textbox")).toBeInTheDocument();
		expect(await screen.findByRole("button")).toBeInTheDocument();
	});

	test("新しい項目を入力すると、リクエストを送る。", async () => {
		const todoText = "todo 123";
		render(<App />);

		await userEvent.type(screen.getByRole("textbox"), todoText);
		await userEvent.click(screen.getByRole("button"));

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith("/api/todo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: todoText }),
			});
		});
	});

	test("新しい項目を入力すると、バックエンドから再度項目を取得する。", async () => {
		const todoText = "todo 123";
		render(<App />);

		const response = {
			ok: true,
			json: () => Promise.resolve([{ id: "new", text: todoText }]),
		};
		global.fetch = vi.fn().mockResolvedValue(response);

		await userEvent.type(screen.getByRole("textbox"), todoText);
		await userEvent.click(screen.getByRole("button"));

		expect(await screen.findByText(todoText)).toBeInTheDocument();
	});
});
