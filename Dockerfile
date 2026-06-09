# Stage 1: Build the Vite application
FROM node:22-alpine as build
WORKDIR /app

# Copy package metadata
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application source code
COPY . .

# Build the app for production
RUN pnpm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Cloud Run expects
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
