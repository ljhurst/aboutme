resource "aws_s3_bucket" "static_site" {
  provider = aws.west
  bucket   = "lj-aboutme"
}

resource "aws_s3_bucket_website_configuration" "static_site" {
  provider = aws.west
  bucket   = aws_s3_bucket.static_site.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_policy" "static_site" {
  provider = aws.west
  bucket   = aws_s3_bucket.static_site.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.static_site.arn}/*"
      }
    ]
  })
}
