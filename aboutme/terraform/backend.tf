resource "aws_lambda_function" "top_tracks" {
  function_name = "lj-aboutme-top-tracks"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs24.x"

  environment {
    variables = {
      "DEBUG"                 = "top-tracks:lambda"
      "SPOTIFY_ACCESS_TOKEN"  = var.spotify_access_token
      "SPOTIFY_CLIENT_ID"     = var.spotify_client_id
      "SPOTIFY_CLIENT_SECRET" = var.spotify_client_secret
      "SPOTIFY_REFRESH_TOKEN" = var.spotify_refresh_token
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
