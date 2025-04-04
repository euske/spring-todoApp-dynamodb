import {LambdaFunctionURLEvent, LambdaFunctionURLResult} from "aws-lambda";

export const handler = async (event: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> => {
    return {
        statusCode: 200,
        body: ""
    }
}