import {Callback, Context, LambdaFunctionURLEvent} from "aws-lambda";
import {APIGatewayProxyStructuredResultV2} from "aws-lambda/trigger/api-gateway-proxy";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand} from "@aws-sdk/lib-dynamodb";

export const tableName = "todo"

export type TodoItem = {
    id: string,
    text: string,
}

export const handler = async (event: LambdaFunctionURLEvent, context: Context, callback: Callback, options?: any): Promise<APIGatewayProxyStructuredResultV2> => {
    const client = new DynamoDBClient(options);
    const docClient = DynamoDBDocumentClient.from(client);

    const http = event.requestContext.http
    const method = http.method
    const path = http.path
    const components = path.split("/")

    if (method === "POST") {
        const request = JSON.parse(event.body || "{}")
        const id = crypto.randomUUID()
        const command = new PutCommand({
            TableName: tableName,
            Item: {
                id: id,
                text: request.text,
            }
        })
        await docClient.send(command)
        return {
            statusCode: 200,
            body: id
        }

    } else if (method === "DELETE" && 3 <= components.length) {
        const id = components[2]
        const command = new DeleteCommand({
            TableName: tableName,
            Key: {
                id: id,
            }
        })
        await docClient.send(command)
        return {
            statusCode: 200,
            body: id
        }

    } else if (method === "GET" && 3 <= components.length) {
        const id = components[2]
        const command = new GetCommand({
            TableName: tableName,
            Key: {
                id: id,
            }
        })
        const response = await docClient.send(command)
        const item = response.Item
        if (item === undefined) {
            return {
                statusCode: 404,
                body: `not found: ${id}`
            }
        } else {
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(response.Item)
            }
        }

    } else if (method === "GET") {
        const command = new ScanCommand({
            TableName: tableName,
        })
        const response = await docClient.send(command)
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(response.Items)
        }

    } else {
        return {
            statusCode: 400,
            body: "bad request"
        }
    }
}