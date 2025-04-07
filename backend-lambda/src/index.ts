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

    if (event.requestContext.http.method === "POST") {
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
    }

    if (event.requestContext.http.method === "DELETE") {
        const path = event.requestContext.http.path
        const args = path.split("/")
        const id = args[2]
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
    }

    const path = event.requestContext.http.path
    const args = path.split("/")
    if (args.length < 3) {
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
        const id = args[2]
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
    }
}