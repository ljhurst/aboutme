locals {
  lambda_boundary_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/stych/aboutme-boundary"

  lambda_functions_with_params = {
    for key, function in local.lambda_functions : key => function if length(function.ssm_params) > 0
  }
}

resource "aws_iam_role" "lambda" {
  for_each = local.lambda_functions

  name                 = "aboutme-${replace(each.key, "_", "-")}"
  permissions_boundary = local.lambda_boundary_arn

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_ssm" {
  for_each = local.lambda_functions_with_params

  name = "aboutme-lambda-ssm"
  role = aws_iam_role.lambda[each.key].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameters"]
      Resource = [for param in each.value.ssm_params : "${local.ssm_param_arn_prefix}${param}"]
    }]
  })
}

resource "aws_iam_role_policy" "lambda_logs" {
  for_each = local.lambda_functions

  name = "lambda-cloudwatch-logs"
  role = aws_iam_role.lambda[each.key].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
      Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${each.value.name}:*"
    }]
  })
}
