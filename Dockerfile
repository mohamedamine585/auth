# Base image
FROM node:24.7.0-alpine

# Install build dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies and rebuild native modules
RUN npm install --legacy-peer-deps

# Bundle app source
COPY . .

# Copy the .env and .env.development files
COPY .env ./

# Rebuild native modules to ensure they match the container architecture
RUN npm rebuild bcrypt --build-from-source

# Creates a "dist" folder with the production build
RUN npm run build

# Expose the port on which the app will run
EXPOSE 3000

# Start the server using the production build
CMD ["npm", "run", "start:prod"]