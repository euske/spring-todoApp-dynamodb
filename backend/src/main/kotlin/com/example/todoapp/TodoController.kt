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
class TodoController(
    @Autowired
    private val client: DynamoDbClient,
    @Value("\${aws.dynamodb.tableName}")
    private val tableName: String,
) {

    @PostMapping("/todo")
    fun addTodoItem(@RequestBody request: TodoRequest): String {
        val PK = UUID.randomUUID().toString()
        val item = mapOf(
            "PK" to AttributeValue.fromS(PK),
            "text" to AttributeValue.fromS(request.text)
        )
        val putItemRequest = PutItemRequest.builder()
            .tableName(tableName)
            .item(item)
            .build()
        client.putItem(putItemRequest)
        return PK
    }

    @GetMapping("/todo")
    fun getAllTodoItems(): List<TodoItem> {

        val request = ScanRequest.builder()
            .tableName(tableName)
            .build()
        val response = client.scan(request)
        val items: List<Map<String, AttributeValue>> = response.items().toList()
        val todoItems = items.map {
            TodoItem(
                id = it["PK"]!!.s(),
                text = it["text"]!!.s()
            )
        }
        return todoItems
    }

    @GetMapping("/todo/{id}")
    fun getTodoItem(@PathVariable id: String): ResponseEntity<TodoItem> {
        val todoItems = getAllTodoItems()
        val todoItem = todoItems.find { it.id == id }
        if (todoItem != null) {
            return ResponseEntity(todoItem, HttpStatus.OK)
        } else {
            return ResponseEntity(HttpStatus.NOT_FOUND)
        }
    }

    @DeleteMapping("/todo/{id}")
    fun deleteTodoItem(@PathVariable id: String) {
        val deleteRequest = DeleteItemRequest.builder()
            .tableName(tableName)
            .key(mapOf("PK" to AttributeValue.fromS(id))) // .key({ PK: item.PK })
            .build()
        client.deleteItem(deleteRequest)
    }
}