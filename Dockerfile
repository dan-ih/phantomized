FROM ubuntu:18.04

WORKDIR /app/

COPY docker-entrypoint.sh /usr/local/bin/

# Setup system deps
RUN apt-get update && \
  apt-get -y install build-essential curl rsync tar python python-pip git libfontconfig1

# Setup Node
ARG NODE_VERSION=10.19.0

RUN git clone https://github.com/creationix/nvm.git /.nvm && echo "source /.nvm/nvm.sh" >> /etc/bash.bashrc
RUN /bin/bash -c 'source /.nvm/nvm.sh && nvm install $NODE_VERSION && nvm use $NODE_VERSION && nvm alias default $NODE_VERSION && ln -s /.nvm/versions/node/v$NODE_VERSION/bin/node /usr/local/bin/node && ln -s /.nvm/versions/node/v$NODE_VERSION/bin/npm /usr/local/bin/npm'

ARG NPM_VERSION=6.13.4
RUN npm install -g npm@$NPM_VERSION

# Setup dockerize
RUN pip install dockerize

# Copy package.json
COPY ./package.json ./package-lock.json ./

# Install node deps
RUN npm ci

COPY ./babel.config.js ./

# Copy script
COPY ./src ./src/

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "create"]
