# Backend

## Contributor's Guide

### Installation
_Note: This guide assumes that your CWD is in `backend`_
1. Install `pdm`
2. Run `pdm install` to install all of the necessary packages
3. You're done!

### Running
If you want to run the Flask server for development, run `pdm run flask run --debug`. Otherwise, just leave out the `--debug`.

### Testing

To run all of the tests, run `pdm run pytest`. If you don't want to generate coverage reports, run `pdm run pytest --no-cov` instead.

