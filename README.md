# Phantomized

An automated build to tar up dynamic ELFs required by PhantomJS using Dockerized. This makes dockerizing PhantomJS with base images like Alpine Linux easy.

This build does not include the phantomjs binary itself so make it easier for application that install PhantomJS through other sources like [npm](https://github.com/Medium/phantomjs). This is based off the work of [docker-phantomjs2](https://github.com/fgrehm/docker-phantomjs2).

## How To

Adding this line to your Dockerfile applies all files to your docker image. You can find a production example for the upstream repository [here](https://github.com/Gravebot/Gravebot/blob/master/Dockerfile).

```bash
$ curl -Ls "https://github.com/mixmaxhq/phantomized/releases/download/v2.1.1/dockerized-phantomjs.tar.gz" | tar xz -C /
```

The archive above includes fontconfig files from the `/etc` and fonts from the `/usr/share/fonts` tree - this may not be appropriate for all use-cases. You can use the following line to apply all but these files to your docker image:

```bash
$ curl -Ls "https://github.com/mixmaxhq/phantomized/releases/download/v2.1.1/dockerized-phantomjs-minimal.tar.gz" | tar xz -C /
```

## Build from source

Make sure your have your docker environment set up correctly, and run the build script. Running the build script will build the docker container and copy the newly created `dockerized-phantomjs.tar.gz` to your current working directory.

```bash
./build.sh
```
