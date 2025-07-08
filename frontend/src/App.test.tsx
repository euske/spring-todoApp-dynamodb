import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, expect } from "vitest";
import App, { type TodoItem } from "./App.tsx";

describe("App", () => {
	const todoItems: TodoItem[] = [
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
		expect(
			await screen.findByRole("button", { name: "Add" }),
		).toBeInTheDocument();
	});

	test("新しい項目を入力すると、リクエストを送る。", async () => {
		const todoText = "todo 123";
		render(<App />);

		await userEvent.type(screen.getByRole("textbox"), todoText);
		await userEvent.click(screen.getByRole("button", { name: "Add" }));

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith("/api/todo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: todoText }),
			});
		});
	});

	test("新しい項目を入力すると、バックエンドから再度全項目を取得する。", async () => {
		const todoText = "todo 123";
		render(<App />);

		const response = {
			ok: true,
			json: () => Promise.resolve([{ id: "new", text: todoText } as TodoItem]),
		};
		global.fetch = vi.fn().mockResolvedValue(response);

		await userEvent.type(screen.getByRole("textbox"), todoText);
		await userEvent.click(screen.getByRole("button", { name: "Add" }));

		expect(await screen.findByText(todoText)).toBeInTheDocument();
	});

	test("ある項目の右にある削除ボタンを押すと、その項目を削除する。", async () => {
		render(<App />);

		const item = await screen.findByText(todoItems[0].text);
		await userEvent.click(within(item).getByRole("button", { name: "Delete" }));

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				`/api/todo/${todoItems[0].id}`,
				{
					method: "DELETE",
				},
			);
		});
	});

	test("項目を削除後、バックエンドから再度全項目を取得する。", async () => {
		render(<App />);

		const response = {
			ok: true,
			json: () => Promise.resolve([todoItems[1]]),
		};
		global.fetch = vi.fn().mockResolvedValue(response);

		const item = await screen.findByText(todoItems[0].text);
		await userEvent.click(within(item).getByRole("button", { name: "Delete" }));

		expect(screen.queryByText(todoItems[0].text)).not.toBeInTheDocument();
	});
});
