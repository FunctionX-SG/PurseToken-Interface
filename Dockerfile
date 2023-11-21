FROM node:alpine

WORKDIR /app
COPY package* ./
COPY . .

# Set the desired port (replace 3000 with your custom port)
ENV PORT=2001

# Install `serve` to run the application.
RUN npm install -g serve

# Uses port which is used by the actual application
EXPOSE 2001

# Run application
#CMD [ "npm", "start" ]
CMD serve -s build
