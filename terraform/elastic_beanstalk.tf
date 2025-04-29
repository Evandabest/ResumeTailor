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

  # Frontend Environment Variables
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NEXT_PUBLIC_SUPABASE_URL"
    value     = var.supabase_url
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    value     = var.supabase_anon_key
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NEXT_PUBLIC_BACKEND_URL"
    value     = "https://${aws_elastic_beanstalk_environment.backend_env.endpoint_url}"
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

  # Backend Environment Variables
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SUPABASE_URL"
    value     = var.supabase_url
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SUPABASE_USER_KEY"
    value     = var.supabase_user_key
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SUPABASE_ADMIN_KEY"
    value     = var.supabase_admin_key
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SUPABASE_JWT_SECRET"
    value     = var.supabase_jwt_secret
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SUPABASE_PSQL_USER"
    value     = var.supabase_psql_user
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SUPABASE_PSQL_PASSWORD"
    value     = var.supabase_psql_password
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SUPABASE_PSQL_HOST"
    value     = var.supabase_psql_host
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SUPABASE_PSQL_PORT"
    value     = var.supabase_psql_port
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SUPABASE_PSQL_DBNAME"
    value     = var.supabase_psql_dbname
  }
}

# Output the environment URLs
output "frontend_url" {
  value = aws_elastic_beanstalk_environment.frontend_env.endpoint_url
}

output "backend_url" {
  value = aws_elastic_beanstalk_environment.backend_env.endpoint_url
}

# Variables for environment configuration
variable "supabase_url" {
  description = "Supabase URL"
  type        = string
}

variable "supabase_user_key" {
  description = "Supabase User Key"
  type        = string
}

variable "supabase_admin_key" {
  description = "Supabase Admin Key"
  type        = string
}

variable "supabase_jwt_secret" {
  description = "Supabase JWT Secret"
  type        = string
}

variable "supabase_psql_user" {
  description = "Supabase PostgreSQL User"
  type        = string
}

variable "supabase_psql_password" {
  description = "Supabase PostgreSQL Password"
  type        = string
}

variable "supabase_psql_host" {
  description = "Supabase PostgreSQL Host"
  type        = string
}

variable "supabase_psql_port" {
  description = "Supabase PostgreSQL Port"
  type        = string
}

variable "supabase_psql_dbname" {
  description = "Supabase PostgreSQL Database Name"
  type        = string
}

variable "supabase_anon_key" {
  description = "Supabase Anonymous Key"
  type        = string
}
