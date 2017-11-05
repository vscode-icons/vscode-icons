# development

If you want to **build** the project you can do this:

```sh
# First, build the image if not already build.
# This should be a one time command.
docker build -t dev docker/development

# Then run it.
# Note that we're using a volume to have access to the artifact in our host (https://docs.docker.com/engine/admin/volumes/volumes/).
# Once the container is done it will automatically be removed and the artifact will be in your mapped folder.
docker run --rm -it -v <your-host-path-here>:/app dev

# Finally, if you want to clean the stale volumes you can run this.
docker volume rm $(docker volume ls -qf dangling=true)
```

If you want to use `Docker` in order to **develop** you can do this:

```sh
# First, build the image if not already build.
# This should be a one time command.
docker build -t dev docker/development

# Then run it.
# Note that we're using a volume to have access to the artifact in our host (https://docs.docker.com/engine/admin/volumes/volumes/).
docker run -it -v <your-host-path-here>:/app dev sh

# Finally, if you want to clean the stale volumes you can run this.
docker volume rm $(docker volume ls -qf dangling=true)
```
