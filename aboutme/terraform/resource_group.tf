resource "aws_resourcegroups_group" "aboutme" {
  name = "${var.project_name}-${var.environment}"

  resource_query {
    query = jsonencode({
      ResourceTypeFilters = ["AWS::AllSupported"]
      TagFilters = [
        {
          Key    = "Project"
          Values = [var.project_name]
        }
      ]
    })
  }
}
