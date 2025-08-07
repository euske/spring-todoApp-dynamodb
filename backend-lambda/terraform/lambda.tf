# IAM role for Lambda execution
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy" "dynamodb_full_access" {
  arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_iam_role" "todo_lambda_role" {
  name               = "lambda_execution_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "todo_lambda_role_attachment" {
  role       = aws_iam_role.todo_lambda_role.name
  policy_arn = data.aws_iam_policy.dynamodb_full_access.arn
}

# Package the Lambda function code
data "archive_file" "empty" {
  type        = "zip"
  source_file = "/dev/null"
  output_path = "/tmp/empty.zip"
}

# Lambda function
resource "aws_lambda_function" "todo_lambda" {
  function_name    = "todo_lambda"
  filename         = data.archive_file.empty.output_path
  role             = aws_iam_role.todo_lambda_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.empty.output_base64sha256

  runtime = "nodejs22.x"

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = "todo"
    }
  }

  tags = {
    Application = "todo"
    Environment = "production"
  }
}

output "function_arn" {
  value = aws_lambda_function.todo_lambda.arn
}