FROM node:lts-fermium


# Create app directory
#COPY ./src/package*.json /home/src
WORKDIR /home/src

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./src/package*.json ./

RUN npm install --registry=https://registry.npm.taobao.org
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./src ./

EXPOSE 9004
# EXPOSE 443
CMD [ "node", "index.js" ]