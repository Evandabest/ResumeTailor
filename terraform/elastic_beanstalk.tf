resource "aws_elastic_beanstalk_application" "resumetailor" {
  name        = "resumetailor-aray1337"
  description = "ResumeTailor application"
}

# Frontend Environment
resource "aws_elastic_beanstalk_environment" "frontend_env" {
  name                = "resumetailor-frontend-aray1337"
  application         = aws_elastic_beanstalk_application.resumetailor.name
  solution_stack_name = "64bit Amazon Linux 2023 v6.5.1 running Node.js 20"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = "aws-elasticbeanstalk-ec2-role"
  }
}

# Backend Environment
resource "aws_elastic_beanstalk_environment" "backend_env" {
  name                = "resumetailor-backend-aray1337"
  application         = aws_elastic_beanstalk_application.resumetailor.name
  solution_stack_name = "64bit Amazon Linux 2023 v4.5.1 running Python 3.11"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = "aws-elasticbeanstalk-ec2-role"
  }
}

# Output the environment URLs
output "frontend_url" {
  value = aws_elastic_beanstalk_environment.frontend_env.endpoint_url
}

output "backend_url" {
  value = aws_elastic_beanstalk_environment.backend_env.endpoint_url
}
