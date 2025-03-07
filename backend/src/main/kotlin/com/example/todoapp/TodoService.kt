package com.example.todoapp

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest
import software.amazon.awssdk.services.dynamodb.model.ScanRequest
import java.util.*

@Service
class TodoService(
    @Autowired
    private val client: DynamoDbClient,
    @Value("\${aws.dynamodb.tableName}")
    private val tableName: String,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    init {
        logger.info("init: tableName=$tableName")
    }

    fun addTodoItem(text: String): String {
        logger.info("addTodoItem: text=$text")
        val id = UUID.randomUUID().toString()
        val item = mapOf(
            "id" to AttributeValue.fromS(id),
            "text" to AttributeValue.fromS(text)
        )
        val putItemRequest = PutItemRequest.builder()
            .tableName(tableName)
            .item(item)
            .build()
        client.putItem(putItemRequest)
        return id
    }

    fun getAllTodoItems(): List<TodoItem> {
        logger.info("getAllTodoItems")
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

    fun getTodoItem(id: String): TodoItem? {
        logger.info("getTodoItem: id=$id")
        val todoItems = getAllTodoItems()
        val todoItem = todoItems.find { it.id == id }
        return todoItem
    }

    fun deleteTodoItem(id: String) {
        logger.info("deleteTodoItem: id=$id")
        val deleteRequest = DeleteItemRequest.builder()
            .tableName(tableName)
            .key(mapOf("id" to AttributeValue.fromS(id))) // .key({ id: item.id })
            .build()
        client.deleteItem(deleteRequest)
    }

}
