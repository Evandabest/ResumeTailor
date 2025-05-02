resource "aws_ecr_repository" "compile-latex" {
  image_tag_mutability = "MUTABLE"
  name                 = "compile-latex"
  tags                 = {}
  tags_all             = {}

  encryption_configuration {
    encryption_type = "AES256"
  }

  image_scanning_configuration {
    scan_on_push = false
  }
}


resource "aws_ecr_repository_policy" "compile-latex" {
  policy = jsonencode(
    {
      Statement = [
        {
          Action = [
            "ecr:BatchGetImage",
            "ecr:GetDownloadUrlForLayer",
            "ecr:SetRepositoryPolicy",
            "ecr:DeleteRepositoryPolicy",
            "ecr:GetRepositoryPolicy",
          ]
          Effect = "Allow"
          Principal = {
            Service = "lambda.amazonaws.com"
          }
          Sid = "LambdaECRImageRetrievalPolicy"
        },
      ]
      Version = "2008-10-17"
    }
  )
  repository = "compile-latex"
}