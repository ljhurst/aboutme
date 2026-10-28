locals {
  lambda_functions = {
    top_tracks = {
      name       = "lj-aboutme-top-tracks"
      ssm_params = [local.spotify_client_secret_ssm_param, local.spotify_refresh_token_ssm_param]
    }
    current_contribs = {
      name       = "lj-aboutme-current-contribs"
      ssm_params = []
    }
    recent_runs = {
      name       = "lj-aboutme-recent-runs"
      ssm_params = [local.garmin_email_ssm_param, local.garmin_password_ssm_param]
    }
  }
}

resource "aws_lambda_function" "top_tracks" {
  function_name = local.lambda_functions.top_tracks.name
  role          = aws_iam_role.lambda["top_tracks"].arn
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

  filename         = "${var.lambda_package_dir}/top-tracks.zip"
  source_code_hash = filebase64sha256("${var.lambda_package_dir}/top-tracks.zip")
}

resource "aws_lambda_function" "current_contribs" {
  function_name = local.lambda_functions.current_contribs.name
  role          = aws_iam_role.lambda["current_contribs"].arn
  handler       = "index.handler"
  runtime       = "nodejs24.x"
  timeout       = 10

  environment {
    variables = {
      "DEBUG" = "current-contribs:lambda"
    }
  }

  filename         = "${var.lambda_package_dir}/current-contribs.zip"
  source_code_hash = filebase64sha256("${var.lambda_package_dir}/current-contribs.zip")
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
  function_name = local.lambda_functions.recent_runs.name
  role          = aws_iam_role.lambda["recent_runs"].arn
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

  filename         = "${var.lambda_package_dir}/recent-runs.zip"
  source_code_hash = filebase64sha256("${var.lambda_package_dir}/recent-runs.zip")
}

resource "aws_cloudwatch_log_group" "recent_runs" {
  name              = "/aws/lambda/${aws_lambda_function.recent_runs.function_name}"
  retention_in_days = 14
}
