import {useEffect, useState} from 'react'

type TodoItem = {
  id: string,
  text: string,
}

function App() {
  const [items, setItems] = useState<TodoItem[]>([])
  useEffect(() => {
    fetch('/api/todo/').then(
      (response) => response.json().then(
        (items: TodoItem[]) => setItems(items)
      )
    )
  })
  
  return <>
    <div>TODO</div>
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  </>
}

export default App
