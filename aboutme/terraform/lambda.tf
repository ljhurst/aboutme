resource "aws_lambda_function" "top_tracks" {
  function_name = "lj-aboutme-top-tracks"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs24.x"

  environment {
    variables = {
      "DEBUG"                           = "top-tracks:lambda"
      "SPOTIFY_CLIENT_ID"               = var.spotify_client_id
      "SPOTIFY_CLIENT_SECRET_SSM_PARAM" = local.spotify_client_secret_ssm_param
      "SPOTIFY_REFRESH_TOKEN_SSM_PARAM" = local.spotify_refresh_token_ssm_param
    }
  }

  filename = "lambda_placeholder.zip"

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_lambda_function" "current_contribs" {
  function_name = "lj-aboutme-current-contribs"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs24.x"
  timeout       = 10

  environment {
    variables = {
      "DEBUG" = "current-contribs:lambda"
    }
  }

  filename = "lambda_placeholder.zip"

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "top_tracks" {
  name              = "/aws/lambda/${aws_lambda_function.top_tracks.function_name}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "current_contribs" {
  name              = "/aws/lambda/${aws_lambda_function.current_contribs.function_name}"
  retention_in_days = 14
}

resource "aws_lambda_function" "recent_runs" {
  function_name = "lj-aboutme-recent-runs"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs24.x"
  timeout       = 10

  environment {
    variables = {
      "DEBUG"                     = "recent-runs:lambda"
      "GARMIN_EMAIL_SSM_PARAM"    = local.garmin_email_ssm_param
      "GARMIN_PASSWORD_SSM_PARAM" = local.garmin_password_ssm_param
    }
  }

  filename = "lambda_placeholder.zip"

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

resource "aws_cloudwatch_log_group" "recent_runs" {
  name              = "/aws/lambda/${aws_lambda_function.recent_runs.function_name}"
  retention_in_days = 14
}
