# Use the official Node.js image.
FROM node:18-slim

# Set the working directory.
WORKDIR /var/www/ims-nest-api-starter

# Install wait-for-it
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

# Copy package.json and package-lock.json to the working directory.
COPY package*.json ./

# Install app dependencies.
RUN npm install

# Expose the application port.
EXPOSE 8000

COPY . .

# Set the entrypoint command to wait for the database and then start the application
CMD wait-for-it db:5432 -- npm run start:dev --preserveWatchOutput