package com.example.todoapp

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.not
import org.junit.jupiter.api.Test
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.testcontainers.containers.localstack.LocalStackContainer
import org.testcontainers.containers.output.Slf4jLogConsumer
import org.testcontainers.utility.DockerImageName
import org.testcontainers.utility.MountableFile
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.dynamodb.DynamoDbClient
import software.amazon.awssdk.services.dynamodb.model.AttributeValue
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest
import software.amazon.awssdk.services.dynamodb.model.ScanRequest


@SpringBootTest(
	webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
	properties = ["spring.main.allow-bean-definition-overriding=true"]
)
@AutoConfigureMockMvc
class TodoappApplicationTests(
	@Autowired
	private val client: DynamoDbClient,
	@Value("\${aws.dynamodb.tableName}")
	private val tableName: String,
) {
	@TestConfiguration
	class DynamoDbTestConfiguration(
		@Value("\${aws.dynamodb.region}")
		private val region: String,
	) {
		@Bean
		fun dynamoDbClient(): DynamoDbClient {
			val image = DockerImageName.parse("localstack/localstack:latest-amd64")
			val initScript = MountableFile.forHostPath("../scripts/localstack")
			val localstack = LocalStackContainer(image)
				.withCopyToContainer(initScript, "/etc/localstack/init/ready.d/")
			localstack.start()
			val logger = LoggerFactory.getLogger("localstack")
			localstack.followOutput(Slf4jLogConsumer(logger))
			val credentials = AwsBasicCredentials.create(localstack.accessKey, localstack.secretKey)
			return DynamoDbClient.builder()
				.endpointOverride(localstack.endpoint)
				.region(Region.of(region))
				.credentialsProvider(StaticCredentialsProvider.create(credentials))
				.build()
		}
	}

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
				.key(mapOf("id" to item["id"])) // .key({ id: item.id })
				.build()
			client.deleteItem(deleteRequest)
		}
	}

	fun postTodo(text: String): String {
		val result = mockMvc
			.perform(
				post("/todo")
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"text\":\"$text\"}"))
			.andReturn()
		val id = result.response.contentAsString
		return id
	}

	@Test
	fun `todoエンドポイントにfooというJSONをPOSTすると、データベースに追加されている`() {
		// setup
		deleteAllItems(tableName)

		val randomText = "foo${Math.random()}"

		// action
		postTodo(randomText)

		// check
		val items = scanAllItems(tableName)
		assertThat(items.size, equalTo(1))

		val firstItem: Map<String, AttributeValue> = items[0]
		val firstItemText: AttributeValue = (firstItem["text"])!!
		val firstItemTextStr: String = firstItemText.s()
		assertThat(firstItemTextStr, equalTo(randomText)) // items[0].text == "foo"
	}

	@Test
	fun `複数回JSONをPOSTすると、その数だけデータベースに追加されている`() {
		// setup
		deleteAllItems(tableName)

		// action
		postTodo("foo")
		postTodo("foo")

		// check
		val items = scanAllItems(tableName)
		assertThat(items.size, equalTo(2))
	}

	@Test
	fun `GETをすると現在のデータベースの項目すべてがリストとして返される`() {
		// setup
		deleteAllItems(tableName)
		postTodo("test123")

		// action + check
		mockMvc.perform(get("/todo"))
			.andExpect(status().isOk)
			.andExpect(jsonPath("$.length()").value(1))
			.andExpect(jsonPath("$[0].text").value("test123"))
	}

	@Test
	fun `POSTしたときに新しく追加されたidを返す`() {
		// setup
		deleteAllItems(tableName)

		// action
		val id = postTodo("foo")

		// check
		mockMvc.perform(get("/todo"))
			.andExpect(status().isOk)
			.andExpect(jsonPath("$.length()").value(1))
			.andExpect(jsonPath("$[0].id").value(id))
	}

	@Test
	fun `GET todo {id}をするとその項目だけを返す`() {
		// setup
		deleteAllItems(tableName)
		val id1 = postTodo("foo")
		val id2 = postTodo("bar")

		// action + check
		mockMvc.perform(get("/todo/{id1}", id1))
			.andExpect(jsonPath("$.id").value(id1))
			.andExpect(jsonPath("$.text").value("foo"))
	}

	@Test
	fun `存在しないIDを取得しようとすると404エラーを返す`() {
		// setup
		deleteAllItems(tableName)

		// action + check
		mockMvc.perform(get("/todo/{id1}", "1234"))
			.andExpect(status().isNotFound)
	}

	@Test
	fun `DELETE todo {id}すると、そのIDを削除する`() {
		// setup
		deleteAllItems(tableName)
		val id1 = postTodo("foo")
		val id2 = postTodo("bar")

		// action
		mockMvc.perform(delete("/todo/{id1}", id1))
			.andExpect(status().isOk)

		// check
		val result = mockMvc.perform(get("/todo"))
			.andReturn()
		val content = result.response.contentAsString
		val mapper = ObjectMapper()
		val items = mapper.readValue<List<TodoItem>>(content)
		assertThat(items.find { it.id == id1 }, equalTo(null))
		assertThat(items.find { it.id == id2 }, not(equalTo(null)))
	}

}
