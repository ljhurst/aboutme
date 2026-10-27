resource "aws_iam_role" "lambda_exec" {
  name                 = "aboutme-lambda-exec"
  permissions_boundary = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/stych/aboutme-boundary"

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

resource "aws_iam_role_policy" "lambda_exec_ssm" {
  name = "aboutme-lambda-exec-ssm"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["ssm:GetParameters"]
      Resource = [
        "${local.ssm_param_arn_prefix}${local.spotify_client_secret_ssm_param}",
        "${local.ssm_param_arn_prefix}${local.spotify_refresh_token_ssm_param}",
        "${local.ssm_param_arn_prefix}${local.garmin_email_ssm_param}",
        "${local.ssm_param_arn_prefix}${local.garmin_password_ssm_param}",
      ]
    }]
  })
}

resource "aws_iam_role_policy" "lambda_exec_logs" {
  name = "lambda-cloudwatch-logs"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}
