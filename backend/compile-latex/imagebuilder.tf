variable "lambda_handler" {
	type = string
}

variable "region" {
	type = string
}

resource "aws_imagebuilder_image_pipeline" "compile-latex" {
  enhanced_image_metadata_enabled  = false
  name                             = "compile-latex"
  status                           = "ENABLED"
  tags                             = {}
  tags_all                         = {}
  container_recipe_arn             = aws_imagebuilder_container_recipe.compile-latex.arn
  infrastructure_configuration_arn = aws_imagebuilder_infrastructure_configuration.compile-latex.arn
  distribution_configuration_arn   = aws_imagebuilder_distribution_configuration.compile-latex.arn
  image_scanning_configuration {
    image_scanning_enabled = false
  }

  image_tests_configuration {
    image_tests_enabled = true
    timeout_minutes     = 720
  }
}

resource "aws_imagebuilder_component" "HelloWorld" {
  version = "0.0.1"

  data     = <<-EOT
            name: Build
            description: This is hello world build document.
            schemaVersion: 1.0

            phases:
              - name: build
                steps:
                  - name: HelloWorldStep
                    action: ExecuteBash
                    inputs:
                        commands:
                            - echo "Hello world!"
       EOT
  name     = "HelloWorld"
  platform = "Linux"
  supported_os_versions = [
    "Amazon Linux 2",
    "Amazon Linux 2023",
  ]
  tags     = {}
  tags_all = {}

}

resource "aws_imagebuilder_container_recipe" "compile-latex" {
  container_type           = "DOCKER"
  version                  = "0.0.2" //The ONLY version line you need to change
  dockerfile_template_data = <<-EOT
        FROM {{{ imagebuilder:parentImage }}}
        {{{ imagebuilder:environments }}}
        RUN echo "Building..."

	RUN apt update
	RUN apt install -y --no-install-suggests texlive-latex-extra python3.11 python3-pip curl
	RUN pip3 install --break-system-packages awslambdaric

	RUN printf ${var.lambda_handler} > /main.py

        WORKDIR "/"
        ENTRYPOINT [ "python3", "-m", "awslambdaric" ]
        CMD [ "main.main" ]
    EOT
  name                     = "compile-latex"
  parent_image             = "debian:bookworm-slim"
  tags                     = {}
  tags_all                 = {}
  working_directory        = "/tmp"


  target_repository {
    repository_name = "compile-latex"
    service         = "ECR"
  }
  component {
    component_arn = aws_imagebuilder_component.HelloWorld.arn
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_imagebuilder_infrastructure_configuration" "compile-latex" {
  instance_profile_name         = "EC2InstanceProfileForImageBuilder"
  instance_types                = []
  name                          = "compile-latex"
  resource_tags                 = {}
  security_group_ids            = []
  tags                          = {}
  tags_all                      = {}
  terminate_instance_on_failure = true
}

resource "aws_imagebuilder_distribution_configuration" "compile-latex" {
  name     = "compile-latex"
  tags     = {}
  tags_all = {}

  distribution {
    license_configuration_arns = []
    region                     = var.region

    container_distribution_configuration {
      container_tags = [
        "latest",
      ]

      target_repository {
        repository_name = "compile-latex"
        service         = "ECR"
      }
    }
  }
}
