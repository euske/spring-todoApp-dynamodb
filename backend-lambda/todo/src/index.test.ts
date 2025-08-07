import { vi, describe, it, expect } from "vitest";
import { Config, handler, TodoItem } from "./index";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { Context, APIGatewayEvent } from "aws-lambda";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

describe("handler", () => {
  const tableName = "todo";
  const config: Config = {
    dynamoDBClientConfig: {
      endpoint: "http://localhost:4566",
      region: "ap-northeast-1",
      credentials: {
        accessKeyId: "xxx",
        secretAccessKey: "yyy",
      },
    },
    dynamoDBTableName: tableName,
  };
  const client = new DynamoDBClient(config.dynamoDBClientConfig);
  const docClient = DynamoDBDocumentClient.from(client);

  const scanAllItems = async (tableName: string) => {
    const command = new ScanCommand({
      TableName: tableName,
    });
    const response = await docClient.send(command);
    return response.Items as TodoItem[];
  };

  const deleteAllItems = async (tableName: string) => {
    const items = await scanAllItems(tableName);
    for (const item of items) {
      const command = new DeleteCommand({
        TableName: tableName,
        Key: {
          id: item.id,
        },
      });
      await docClient.send(command);
    }
  };

  const makeLambdaEvent = (
    httpMethod: HttpMethod,
    path: string,
    body?: unknown,
  ): APIGatewayEvent => {
    return {
      headers: {},
      httpMethod: httpMethod,
      path: path,
      body: body && JSON.stringify(body),
    } as APIGatewayEvent;
  };

  const postTodo = async (text: string): Promise<string> => {
    const event = makeLambdaEvent("POST", "/api/todo", { text: text });
    const response = await handler(event, {} as Context, () => {}, config);
    return response.body! as string;
  };

  it("エンドポイントへのPOSTがステータス200を返す", async () => {
    const event = makeLambdaEvent("POST", "/api/todo", {});
    const response = await handler(event, {} as Context, () => {}, config);

    expect(response.statusCode).toBe(200);
  });

  it("todoエンドポイントにfooというJSONをPOSTすると、データベースに追加されている", async () => {
    await deleteAllItems(tableName);
    const randomText = `foo${Math.random()}`;

    await postTodo(randomText);

    const items = await scanAllItems(tableName);
    expect(items.length).toBe(1);
    expect(items[0].text).toBe(randomText);
  });

  it("複数回JSONをPOSTすると、その数だけデータベースに追加されている", async () => {
    await deleteAllItems(tableName);

    await postTodo("foo");
    await postTodo("foo");

    const items = await scanAllItems(tableName);
    expect(items.length).toBe(2);
  });

  it("GETをすると現在のデータベースの項目すべてがリストとして返される", async () => {
    await deleteAllItems(tableName);
    await postTodo("test123");

    const event = makeLambdaEvent("GET", "/api/todo");
    const response = await handler(event, {} as Context, () => {}, config);

    expect(response.statusCode).toBe(200);
    expect(response.headers!["Content-Type"]).toBe("application/json");
    const items = JSON.parse(response.body!) as TodoItem[];
    expect(items.length).toBe(1);
    expect(items[0].text).toBe("test123");
  });

  it("POSTしたときに新しく追加されたidを返す", async () => {
    await deleteAllItems(tableName);

    const id = await postTodo("foo");

    const items = await scanAllItems(tableName);
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(id);
  });

  it("GET todo/{id}をするとその項目だけを返す", async () => {
    await deleteAllItems(tableName);

    const id1 = await postTodo("foo");
    await postTodo("bar");

    const event = makeLambdaEvent("GET", `/api/todo/${id1}`);
    const response = await handler(event, {} as Context, () => {}, config);

    const item = JSON.parse(response.body!) as TodoItem;
    expect(item.id).toBe(id1);
    expect(item.text).toBe("foo");
  });

  it("存在しないIDを取得しようとすると404エラーを返す", async () => {
    await deleteAllItems(tableName);

    const event = makeLambdaEvent("GET", "/api/todo/1234");
    const response = await handler(event, {} as Context, () => {}, config);

    expect(response.statusCode).toBe(404);
  });

  it("DELETE todo/{id}すると、そのIDを削除する", async () => {
    await deleteAllItems(tableName);
    const id1 = await postTodo("foo");
    const id2 = await postTodo("bar");

    const event = makeLambdaEvent("DELETE", `/api/todo/${id2}`);
    await handler(event, {} as Context, () => {}, config);

    const items: TodoItem[] = await scanAllItems(tableName);
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(id1);
    expect(items[0].text).toBe("foo");
  });
});
