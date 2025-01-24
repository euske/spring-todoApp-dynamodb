package com.example.todoapp

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.hasSize
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import software.amazon.awssdk.auth.credentials.AnonymousCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest
import software.amazon.awssdk.services.dynamodb.model.ScanRequest
import java.net.URI
import java.util.*

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class TodoappApplicationTests {

	private val client = DynamoDbClient.builder()
		.endpointOverride(URI.create("http://localhost:4566"))
		.credentialsProvider(AnonymousCredentialsProvider.create())
		.region(Region.AP_NORTHEAST_1)
		.build()

	@Autowired
	private lateinit var mockMvc: MockMvc

	@Test
	fun contextLoads() {
	}

	@Test
	fun `todoエンドポイントにJSONをPOSTすると、200 OKが返る`() {
		mockMvc.perform(post("/todo")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{}"))
			.andExpect(status().isOk)
	}

	fun scanAllItems(tableName: String): List<Map<String, AttributeValue>> {
		val request = ScanRequest.builder()
			.tableName(tableName)
			.build()
		val response = client.scan(request)
		return response.items().toList()
	}

	fun deleteAllItems(tableName: String) {
		val items = scanAllItems(tableName)
		for (item in items) {
			val deleteRequest = DeleteItemRequest.builder()
				.tableName(tableName)
				.key(mapOf("PK" to item["PK"])) // .key({ PK: item.PK })
				.build()
			client.deleteItem(deleteRequest)
		}
	}

	@Test
	fun `todoエンドポイントにfooというJSONをPOSTすると、データベースに追加されている`() {
		// setup
		deleteAllItems("test")

		val randomText = "foo${Math.random()}"

		// action
		mockMvc.perform(post("/todo")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"text\":\"$randomText\"}"))
			.andExpect(status().isOk)

		// check
		val items = scanAllItems("test")
		assertThat(items.size, equalTo(1))

		val firstItem: Map<String, AttributeValue> = items[0]
		val firstItemText: AttributeValue = (firstItem["text"])!!
		val firstItemTextStr: String = firstItemText.s()
		assertThat(firstItemTextStr, equalTo(randomText)) // items[0].text == "foo"
	}

	@Test
	fun `複数回JSONをPOSTすると、その数だけデータベースに追加されている`() {
		// setup
		deleteAllItems("test")

		// action
		mockMvc.perform(post("/todo")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"text\":\"foo\"}"))
			.andExpect(status().isOk)
		mockMvc.perform(post("/todo")
			.contentType(MediaType.APPLICATION_JSON)
			.content("{\"text\":\"foo\"}"))
			.andExpect(status().isOk)

		// check
		val items = scanAllItems("test")
		assertThat(items.size, equalTo(2))
	}

	@Test
	fun `GETをすると現在のデータベースの項目すべてがリストとして返される`() {
		// setup
		deleteAllItems("test")
		val item = mapOf(
			"PK" to AttributeValue.fromS(UUID.randomUUID().toString()),
			"text" to AttributeValue.fromS("test123")
		)
		val putItemRequest = PutItemRequest.builder()
			.tableName("test")
			.item(item)
			.build()
		client.putItem(putItemRequest)

		// action + check
		mockMvc.perform(get("/todo"))
			.andExpect(status().isOk)
			.andExpect(jsonPath("$.length()").value(1))
			.andExpect(jsonPath("$[0].text").value("test123"))
	}

}
