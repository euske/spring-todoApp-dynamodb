package com.example.todoapp

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.AwsCredentialsProviderChain
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
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
    private val logger = LoggerFactory.getLogger(javaClass)

    @Bean
    fun dynamoDbClient(): DynamoDbClient {
        logger.info("dynamoDbClient: region=$region, endpoint=$endpoint")
        val dummyCredentials = AwsBasicCredentials.create("xxx", "yyy")
        return DynamoDbClient.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of(region))
            .credentialsProvider(
                AwsCredentialsProviderChain.of(
                    DefaultCredentialsProvider.create(),
                    StaticCredentialsProvider.create(dummyCredentials),
                )
            )
            .build()
    }
}