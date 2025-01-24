package com.example.todoapp

import org.springframework.web.bind.annotation.*
import software.amazon.awssdk.auth.credentials.AnonymousCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest
import software.amazon.awssdk.services.dynamodb.model.ScanRequest
import java.net.URI

class TodoRequest {
    var text: String = ""
}

//class TodoItem {
//    var PK: String = "" //variable
//    var text: String = ""
//}
//
data class TodoItem(
    val PK: String, //value
    val text: String
)

@RestController
class TodoController {

    @PostMapping("/todo")
    fun addTodoItem(@RequestBody request: TodoRequest): String {
        println("request.text=${request.text}")
        val item = mapOf(
            "PK" to AttributeValue.fromS("PK${Math.random()}"),
            "text" to AttributeValue.fromS(request.text)
        )
        val client = DynamoDbClient.builder()
            .endpointOverride(URI.create("http://localhost:4566"))
            .credentialsProvider(AnonymousCredentialsProvider.create())
            .region(Region.AP_NORTHEAST_1)
            .build()
        val putItemRequest = PutItemRequest.builder()
            .tableName("test")
            .item(item)
            .build()
        client.putItem(putItemRequest)

        return "OK"
    }

    @GetMapping("/todo")
    fun getAllTodoItems(): List<TodoItem> {
        val client = DynamoDbClient.builder()
            .endpointOverride(URI.create("http://localhost:4566"))
            .credentialsProvider(AnonymousCredentialsProvider.create())
            .region(Region.AP_NORTHEAST_1)
            .build()
        val request = ScanRequest.builder()
            .tableName("test")
            .build()
        val response = client.scan(request)
        val items: List<Map<String, AttributeValue>> = response.items().toList()
//        val todoItems: MutableList<TodoItem> = mutableListOf()
//        for (item in items) {
//            val todoItem = TodoItem()
//            todoItem.PK = item["PK"]!!.s()
//            todoItem.text = item["text"]!!.s()
//            todoItems.add(todoItem)
//        }

        // todoItems = items.map( (item) => { ... } )

        // Idiomatic
        val todoItems = items.map {
            TodoItem(
                PK = it["PK"]!!.s(),
                text = it["text"]!!.s()
            )
        }
        return todoItems
    }

}