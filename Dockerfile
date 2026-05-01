# Use an official Node.js runtime as a parent image (Bullseye has good compatibility)
FROM node:18-bullseye-slim

# Install Python 3, pip, and system dependencies required for OpenCV
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python-is-python3 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the Python engine requirements first (to cache the pip install step)
COPY python-engine/requirements.txt ./python-engine/

# Install Python dependencies (OpenCV, scikit-image, reedsolo, pycryptodome)
RUN pip3 install --no-cache-dir -r python-engine/requirements.txt

# Copy the Node.js backend package files
COPY backend/package*.json ./backend/

# Install Node.js dependencies
WORKDIR /usr/src/app/backend
RUN npm install

# Copy the rest of the application source code
WORKDIR /usr/src/app
COPY python-engine/ ./python-engine/
COPY backend/ ./backend/

# Create the uploads and outputs directories that the backend uses
RUN mkdir -p ./backend/uploads ./backend/outputs

# Expose the port that your Express server runs on
EXPOSE 5000

# Set the working directory to the backend and start the server
WORKDIR /usr/src/app/backend
CMD ["npm", "start"]
