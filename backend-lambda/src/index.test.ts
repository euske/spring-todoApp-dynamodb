import { vi, describe, it, expect } from "vitest";
import { Config, handler, TodoItem } from "./index";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { Context, LambdaFunctionURLEvent } from "aws-lambda";

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

  const postTodo = async (tableName: string, text: string): Promise<string> => {
    const request = {
      text: text,
    };
    const event = {
      headers: {},
      requestContext: {
        http: {
          method: "POST",
          path: "/api/todo",
        },
      },
      body: JSON.stringify(request),
    } as LambdaFunctionURLEvent;

    const response = await handler(event, {} as Context, () => {}, config);
    return response.body! as string;
  };

  it("エンドポイントへのPOSTがステータス200を返す", async () => {
    const event = {
      headers: {},
      requestContext: {
        http: {
          method: "POST",
          path: "/api/todo",
        },
      },
      body: "{}",
    } as LambdaFunctionURLEvent;
    const response = await handler(event, {} as Context, () => {}, config);

    expect(response.statusCode).toBe(200);
  });

  it("todoエンドポイントにfooというJSONをPOSTすると、データベースに追加されている", async () => {
    await deleteAllItems(tableName);
    const randomText = `foo${Math.random()}`;

    await postTodo(tableName, randomText);

    const items = await scanAllItems(tableName);
    expect(items.length).toBe(1);
    expect(items[0].text).toBe(randomText);
  });

  it("複数回JSONをPOSTすると、その数だけデータベースに追加されている", async () => {
    await deleteAllItems(tableName);

    await postTodo(tableName, "foo");
    await postTodo(tableName, "foo");

    const items = await scanAllItems(tableName);
    expect(items.length).toBe(2);
  });

  it("GETをすると現在のデータベースの項目すべてがリストとして返される", async () => {
    await deleteAllItems(tableName);
    await postTodo(tableName, "test123");

    const event = {
      headers: {},
      requestContext: {
        http: {
          method: "GET",
          path: "/api/todo",
        },
      },
    } as LambdaFunctionURLEvent;
    const response = await handler(event, {} as Context, () => {}, config);

    expect(response.statusCode).toBe(200);
    expect(response.headers!["Content-Type"]).toBe("application/json");
    const items = JSON.parse(response.body!) as TodoItem[];
    expect(items.length).toBe(1);
    expect(items[0].text).toBe("test123");
  });

  it("POSTしたときに新しく追加されたidを返す", async () => {
    await deleteAllItems(tableName);

    const id = await postTodo(tableName, "foo");

    const items = await scanAllItems(tableName);
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(id);
  });

  it("GET todo/{id}をするとその項目だけを返す", async () => {
    await deleteAllItems(tableName);

    const id1 = await postTodo(tableName, "foo");
    await postTodo(tableName, "bar");

    const event = {
      headers: {},
      requestContext: {
        http: {
          method: "GET",
          path: `/api/todo/${id1}`,
        },
      },
    } as LambdaFunctionURLEvent;
    const response = await handler(event, {} as Context, () => {}, config);

    const item = JSON.parse(response.body!) as TodoItem;
    expect(item.id).toBe(id1);
    expect(item.text).toBe("foo");
  });

  it("存在しないIDを取得しようとすると404エラーを返す", async () => {
    await deleteAllItems(tableName);

    const event = {
      headers: {},
      requestContext: {
        http: {
          method: "GET",
          path: `/api/todo/1234`,
        },
      },
    } as LambdaFunctionURLEvent;
    const response = await handler(event, {} as Context, () => {}, config);

    expect(response.statusCode).toBe(404);
  });

  it("DELETE todo/{id}すると、そのIDを削除する", async () => {
    await deleteAllItems(tableName);
    const id1 = await postTodo(tableName, "foo");
    const id2 = await postTodo(tableName, "bar");

    const event = {
      headers: {},
      requestContext: {
        http: {
          method: "DELETE",
          path: `/api/todo/${id2}`,
        },
      },
    } as LambdaFunctionURLEvent;
    await handler(event, {} as Context, () => {}, config);

    const items: TodoItem[] = await scanAllItems(tableName);
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(id1);
    expect(items[0].text).toBe("foo");
  });
});
