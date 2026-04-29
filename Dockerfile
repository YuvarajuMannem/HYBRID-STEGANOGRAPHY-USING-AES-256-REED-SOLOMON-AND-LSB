FROM node:18-bullseye-slim

# Install Python 3 and pip
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

# Copy the backend and python engine into the container
COPY backend/ ./backend/
COPY python-engine/ ./python-engine/

# Install Python dependencies
RUN pip3 install --no-cache-dir -r python-engine/requirements.txt

# Install Node dependencies
WORKDIR /app/backend
RUN npm install

# Start the server
EXPOSE 5000
CMD ["npm", "start"]
