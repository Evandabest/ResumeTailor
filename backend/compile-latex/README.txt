This script is for setting up an AWS account to host the LaTeX compiler endpoint, as well as updating it.

To use:
	* Before continuing, make sure your CWD is `compile-latex`
	* Put your AWS credentials in the .env file (see Terraform docs for the proper format)
	* Run `terraform init` to set up the proper state

	* Now, run `pdm run deploy.py`

When modifying main.py, remember to update the version number of the recipe (don't worry --- if you happen to forget, Terraform will helpfully remind you when you try to apply the new configuration)



