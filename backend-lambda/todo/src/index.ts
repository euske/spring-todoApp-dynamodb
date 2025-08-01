import { Callback, Context, LambdaFunctionURLEvent } from "aws-lambda";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda/trigger/api-gateway-proxy";
import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

export type Config = {
  dynamoDBClientConfig: DynamoDBClientConfig;
  dynamoDBTableName: string;
};

const getDefaultConfig = (): Config => {
  return {
    dynamoDBClientConfig: {},
    dynamoDBTableName: process.env.DYNAMODB_TABLE_NAME!,
  };
};

export type TodoItem = {
  id: string;
  text: string;
};

export const handler = async (
  event: LambdaFunctionURLEvent,
  context: Context,
  callback: Callback,
  defaultConfig?: Config,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const config = defaultConfig ?? getDefaultConfig();
  console.debug({ config, event, context });

  const tableName = config.dynamoDBTableName;
  const client = new DynamoDBClient(config.dynamoDBClientConfig);
  const docClient = DynamoDBDocumentClient.from(client);

  const http = event.requestContext.http;
  const method = http.method;
  const path = http.path;

  if (method === "POST" && path === "/api/todo") {
    const request = JSON.parse(event.body || "{}");
    const id = crypto.randomUUID();
    const command = new PutCommand({
      TableName: tableName,
      Item: {
        id: id,
        text: request.text,
      },
    });
    await docClient.send(command);
    return {
      statusCode: 200,
      body: id,
    };
  } else if (method === "DELETE" && path.startsWith("/api/todo/")) {
    const id = path.split("/")[3];
    const command = new DeleteCommand({
      TableName: tableName,
      Key: {
        id: id,
      },
    });
    await docClient.send(command);
    return {
      statusCode: 200,
      body: id,
    };
  } else if (method === "GET" && path.startsWith("/api/todo/")) {
    const id = path.split("/")[3];
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        id: id,
      },
    });
    const response = await docClient.send(command);
    const item = response.Item;
    if (item === undefined) {
      return {
        statusCode: 404,
        body: `not found: ${id}`,
      };
    } else {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response.Item),
      };
    }
  } else if (method === "GET" && path === "/api/todo") {
    const command = new ScanCommand({
      TableName: tableName,
    });
    const response = await docClient.send(command);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response.Items),
    };
  } else {
    return {
      statusCode: 400,
      body: "bad request",
    };
  }
};
