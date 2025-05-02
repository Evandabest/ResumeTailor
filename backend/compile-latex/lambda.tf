locals {
  name = "compile-latex"
}
resource "aws_lambda_function" "compile-latex" {
  architectures = [
    "x86_64",
  ]
  function_name                  = "compile-latex"
  role                           = aws_iam_role.compile-latex.arn
  image_uri                      = "${split("/", aws_ecr_repository.compile-latex.repository_url)[0]}/${local.name}:latest"
  layers                         = []
  memory_size                    = 128
  package_type                   = "Image"
  reserved_concurrent_executions = -1
  skip_destroy                   = false
  tags                           = {}
  tags_all                       = {}
  timeout                        = 60

  ephemeral_storage {
    size = 512
  }

  logging_config {
    log_format = "Text"
  }

  tracing_config {
    mode = "PassThrough"
  }
}
resource "aws_lambda_permission" "FunctionURLAllowPublicAccess" {
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = "compile-latex"
  function_url_auth_type = "NONE"
  principal              = "*"
  statement_id           = "FunctionURLAllowPublicAccess"
}

resource "aws_iam_role" "compile-latex" {
  assume_role_policy = jsonencode(
    {
      Statement = [
        {
          Action = "sts:AssumeRole"
          Effect = "Allow"
          Principal = {
            Service = "lambda.amazonaws.com"
          }
        },
      ]
      Version = "2012-10-17"
    }
  )
  force_detach_policies = false
  max_session_duration  = 3600
  name                  = "compile-latex"
  path                  = "/service-role/"
  tags                  = {}
  tags_all              = {}
}
