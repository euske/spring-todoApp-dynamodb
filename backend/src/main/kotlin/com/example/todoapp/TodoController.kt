package com.example.todoapp

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest
import software.amazon.awssdk.services.dynamodb.model.ScanRequest
import java.util.*

data class TodoRequest(
    val text: String = ""
)

data class TodoItem(
    val id: String = "", //value
    val text: String = ""
)

@RestController
@RequestMapping("/api/todo")
class TodoController(
    @Autowired
    private val client: DynamoDbClient,
    @Value("\${aws.dynamodb.tableName}")
    private val tableName: String,
) {

    @PostMapping("/")
    fun addTodoItem(@RequestBody request: TodoRequest): String {
        val id = UUID.randomUUID().toString()
        val item = mapOf(
            "id" to AttributeValue.fromS(id),
            "text" to AttributeValue.fromS(request.text)
        )
        val putItemRequest = PutItemRequest.builder()
            .tableName(tableName)
            .item(item)
            .build()
        client.putItem(putItemRequest)
        return id
    }

    @GetMapping("/")
    fun getAllTodoItems(): List<TodoItem> {
        val request = ScanRequest.builder()
            .tableName(tableName)
            .build()
        val response = client.scan(request)
        val items: List<Map<String, AttributeValue>> = response.items().toList()
        val todoItems = items.map {
            TodoItem(
                id = it["id"]!!.s(),
                text = it["text"]!!.s()
            )
        }
        return todoItems
    }

    @GetMapping("/{id}")
    fun getTodoItem(@PathVariable id: String): ResponseEntity<TodoItem> {
        val todoItems = getAllTodoItems()
        val todoItem = todoItems.find { it.id == id }
        if (todoItem != null) {
            return ResponseEntity(todoItem, HttpStatus.OK)
        } else {
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }
    }

    @DeleteMapping("/{id}")
    fun deleteTodoItem(@PathVariable id: String) {
        val deleteRequest = DeleteItemRequest.builder()
            .tableName(tableName)
            .key(mapOf("id" to AttributeValue.fromS(id))) // .key({ id: item.id })
            .build()
        client.deleteItem(deleteRequest)
    }
}