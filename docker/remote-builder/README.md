# remote-builder

The purpose of this image is to be run and get the artifact from building the extension.

Note that the repo will be cloned directly from Github so it will be working always with the latest published version.

This image was originally created to make it easier to consume the latest version of `icon.json` file in order to build the amazing [github-vscode-icons extension](https://github.com/dderevjanik/github-vscode-icons) by [@dderevjanik](https://github.com/dderevjanik).

## How to use it

Assuming you're in the root folder:

```sh
# First, build the image if not already build.
# This should be a one time command.
docker build -t vsi docker/remote-builder

# Then run it.
# Note that we're using a volume to have access to the artifact in our host (https://docs.docker.com/engine/admin/volumes/volumes/).
# Once the container is done it will automatically be removed and the artifact will be in your mapped folder.
docker run --rm -it -v <your-host-path-here>:/app-out vsi

# Finally, if you want to clean the stale volumes you can run this.
docker volume rm $(docker volume ls -qf dangling=true)
```
