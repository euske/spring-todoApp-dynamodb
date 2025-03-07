import { useEffect, useState } from "react";

type TodoItem = {
	id: string;
	text: string;
};

function App() {
	const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
	const [text, setText] = useState("");

	const updateItems = async () => {
		const response = await fetch("/api/todo/");
		const items: TodoItem[] = await response.json();
		setTodoItems(items);
	};

	const addItem = async (text: string) => {
		await fetch("/api/todo/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text }),
		});
		await updateItems();
	};

	useEffect(() => {
		updateItems();
	}, []);

	return (
		<>
			<div>TODO</div>
			<div>
				<input
					type="text"
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
				<button onClick={() => addItem(text)}>Add</button>
			</div>
			<ul>
				{todoItems.map((item) => (
					<li key={item.id}>{item.text}</li>
				))}
			</ul>
		</>
	);
}

export default App;
