package com.example.todoapp

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import java.net.URI

@Configuration
class DynamoDbConfiguration(
    @Value("\${aws.dynamodb.region}")
    private val region: String,
    @Value("\${aws.dynamodb.endpoint}")
    private val endpoint: String,
) {
    @Bean
    fun dynamoDbClient(): DynamoDbClient {
        return DynamoDbClient.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of(region))
            .build()
    }
}