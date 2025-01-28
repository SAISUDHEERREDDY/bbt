# Dockerfile to generate an application specific build environment containing custom build dependencies
# -remove me-   pass this in using docker-compose.yml
ARG build_image
FROM ${build_image}

# -remove me-   switch to root directory for dependency extraction
# -remove me-       * archives expected to lay down anything necessary to find headers and libraries (usually through pkgconfig)
WORKDIR /

# -remove me-   copy in and extract build dependency archives (they will be in place at this point)
# -remove me-   ex:
COPY base-debian-dev.tgz .
COPY ini-parsing-dev.tgz .

RUN tar -xzf base-debian-dev.tgz --strip-components=2   # strip 2 levels due to subdirs inside the tar
RUN tar -xzf ini-parsing-dev.tgz --strip-components=2   # ditto

# quick default entrypoint that won't continue running (left up to user to override if desired)
ENTRYPOINT [ "true" ]
