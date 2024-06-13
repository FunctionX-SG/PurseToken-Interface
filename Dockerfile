# Use a lightweight Node.js base image
FROM node:alpine

# Set the working directory
WORKDIR /app

# Copy the package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the remaining application files
COPY . .

# Build the application to generate the build folder
RUN npm run build

# Set the desired port (replace 3000 with your custom port)
ENV PORT=2000

# Install `serve` to run the application.
RUN npm install -g serve

# Uses port which is used by the actual application
EXPOSE 2000

# Run application
#CMD [ "npm", "start" ]
CMD serve -s build
