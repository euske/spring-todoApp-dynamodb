resource "aws_api_gateway_rest_api" "todo_api" {
  name = "todo_api"
}

resource "aws_api_gateway_resource" "todo_api_resource_api" {
  rest_api_id = aws_api_gateway_rest_api.todo_api.id
  parent_id   = aws_api_gateway_rest_api.todo_api.root_resource_id
  path_part   = "api"
}

resource "aws_api_gateway_resource" "todo_api_resource_todo" {
  rest_api_id = aws_api_gateway_rest_api.todo_api.id
  parent_id   = aws_api_gateway_resource.todo_api_resource_api.id
  path_part   = "todo"
}

resource "aws_api_gateway_method" "todo_api_method" {
  rest_api_id   = aws_api_gateway_rest_api.todo_api.id
  resource_id   = aws_api_gateway_resource.todo_api_resource_todo.id
  authorization = "NONE"
  http_method   = "ANY"
}

resource "aws_api_gateway_integration" "todo_api_integration" {
  rest_api_id             = aws_api_gateway_rest_api.todo_api.id
  resource_id             = aws_api_gateway_resource.todo_api_resource_todo.id
  http_method             = aws_api_gateway_method.todo_api_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.todo_lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "todo_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.todo_api.id

  triggers = {
    # NOTE: The configuration below will satisfy ordering considerations,
    #       but not pick up all future REST API changes. More advanced patterns
    #       are possible, such as using the filesha1() function against the
    #       Terraform configuration file(s) or removing the .id references to
    #       calculate a hash against whole resources. Be aware that using whole
    #       resources will show a difference after the initial implementation.
    #       It will stabilize to only change when resources change afterwards.
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.todo_api_resource_todo.id,
      aws_api_gateway_method.todo_api_method.id,
      aws_api_gateway_integration.todo_api_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "todo_api_stage" {
  deployment_id = aws_api_gateway_deployment.todo_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.todo_api.id
  stage_name    = "dev"
}

output "invoke_url" {
  value = aws_api_gateway_stage.todo_api_stage.invoke_url
}
