resource "aws_iam_role" "lambda_exec" {
  name = "lj-aboutme-lambda-exec"

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
  name = "lj-aboutme-lambda-exec-ssm"
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

data "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://token.actions.githubusercontent.com"
}

locals {
  github_actions_oidc_condition = {
    StringEquals = {
      "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
    }
    StringLike = {
      "token.actions.githubusercontent.com:sub" = "repo:ljhurst/aboutme:ref:refs/heads/main"
    }
  }
}

resource "aws_iam_role" "github_actions_backend_deploy" {
  name = "lj-aboutme-github-actions-backend-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "sts:AssumeRoleWithWebIdentity"
      Principal = {
        Federated = data.aws_iam_openid_connect_provider.github_actions.arn
      }
      Condition = local.github_actions_oidc_condition
    }]
  })
}

resource "aws_iam_role_policy" "github_actions_deploy_lambda" {
  name = "deploy-lambda-code"
  role = aws_iam_role.github_actions_backend_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:UpdateFunctionCode",
          "lambda:GetFunction"
        ]
        Resource = [
          aws_lambda_function.current_contribs.arn,
          aws_lambda_function.top_tracks.arn,
          aws_lambda_function.recent_runs.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role" "github_actions_frontend_deploy" {
  name = "lj-aboutme-github-actions-frontend-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "sts:AssumeRoleWithWebIdentity"
      Principal = {
        Federated = data.aws_iam_openid_connect_provider.github_actions.arn
      }
      Condition = local.github_actions_oidc_condition
    }]
  })
}

resource "aws_iam_role_policy" "github_actions_deploy_frontend" {
  name = "deploy-frontend-site"
  role = aws_iam_role.github_actions_frontend_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.static_site.arn,
          "${aws_s3_bucket.static_site.arn}/*"
        ]
      }
    ]
  })
}
