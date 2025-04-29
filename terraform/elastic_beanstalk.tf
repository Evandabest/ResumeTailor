resource "aws_elastic_beanstalk_application" "app" {
  name        = "resume-tailor"
  description = "Resume Tailor App"
}

resource "aws_elastic_beanstalk_environment" "env" {
  name                = "resume-tailor-env"
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = "64bit Amazon Linux 2 v3.5.2 running Python 3.8"
  cname_prefix        = "resumetailor-hariskhan"
}
