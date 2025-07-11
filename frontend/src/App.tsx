import { useCallback, useEffect, useState } from "react";

export type TodoItem = {
	id: string;
	text: string;
};

function App() {
	const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
	const [text, setText] = useState("");

	const updateItems = useCallback(async () => {
		const response = await fetch("/api/todo");
		const items: TodoItem[] = await response.json();
		setTodoItems(items);
	}, []);

	const addItem = useCallback(
		async (text: string) => {
			await fetch("/api/todo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text }),
			});
			await updateItems();
		},
		[updateItems],
	);

	const deleteItem = useCallback(
		async (id: string) => {
			await fetch(`/api/todo/${id}`, {
				method: "DELETE",
			});
			await updateItems();
		},
		[updateItems],
	);

	useEffect(() => {
		void updateItems();
	}, [updateItems]);

	return (
		<>
			<div>TODO</div>
			<div>
				<input
					type="text"
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
				<button type="button" onClick={() => addItem(text)}>
					Add
				</button>
			</div>
			<ul>
				{todoItems.map((item) => (
					<li key={item.id}>
						{item.text}
						<button type="button" onClick={() => deleteItem(item.id)}>
							Delete
						</button>
					</li>
				))}
			</ul>
		</>
	);
}

export default App;
