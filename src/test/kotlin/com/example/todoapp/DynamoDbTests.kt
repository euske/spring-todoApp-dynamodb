package com.example.todoapp

import org.junit.jupiter.api.Test
import software.amazon.awssdk.auth.credentials.AnonymousCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest
import software.amazon.awssdk.services.dynamodb.model.ScanRequest
import java.net.URI

class DynamoDbTests {

    @Test
    fun test() {
        val client = DynamoDbClient.builder()
            .endpointOverride(URI.create("http://localhost:4566"))
            .credentialsProvider(AnonymousCredentialsProvider.create())
            .region(Region.AP_NORTHEAST_1)
            .build()
        val request = ScanRequest.builder()
            .tableName("test")
            .build()
        val response = client.scan(request)
        val items = response.items().toList()
        println(items)
    }

    @Test
    fun deleteAll() {
        val client = DynamoDbClient.builder()
            .endpointOverride(URI.create("http://localhost:4566"))
            .credentialsProvider(AnonymousCredentialsProvider.create())
            .region(Region.AP_NORTHEAST_1)
            .build()
        val request = ScanRequest.builder()
            .tableName("test")
            .build()
        val response = client.scan(request)
        val items = response.items().toList()

        for (item in items) {
            val deleteRequest = DeleteItemRequest.builder()
                .tableName("test")
                .key(mapOf("PK" to item["PK"])) // .key({ PK: item.PK })
                .build()
            client.deleteItem(deleteRequest)
        }
    }

    @Test
    fun addItem() {
        val item = mapOf(
            "PK" to AttributeValue.fromS("456"),
            "text" to AttributeValue.fromS("foo")
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

        val scanItemRequest = ScanRequest.builder()
            .tableName("test")
            .build()
        val response = client.scan(scanItemRequest)
        val items = response.items().toList()
        println(items)
    }
}