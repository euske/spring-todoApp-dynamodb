package com.example.todoapp

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class TodoRequest(
    val text: String = ""
)

@RestController
@RequestMapping("/api/todo")
class TodoController(
    @Autowired
    private val todoService: TodoService,
) {
    @PostMapping("/")
    fun addTodoItem(@RequestBody request: TodoRequest): String {
        val id = todoService.addTodoItem(request.text)
        return id
    }

    @GetMapping("/")
    fun getAllTodoItems(): List<TodoItem> {
        val todoItems = todoService.getAllTodoItems()
        return todoItems
    }

    @GetMapping("/{id}")
    fun getTodoItem(@PathVariable id: String): ResponseEntity<TodoItem> {
        val todoItem = todoService.getTodoItem(id)
        if (todoItem != null) {
            return ResponseEntity(todoItem, HttpStatus.OK)
        } else {
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }
    }

    @DeleteMapping("/{id}")
    fun deleteTodoItem(@PathVariable id: String) {
        todoService.deleteTodoItem(id)
    }
}