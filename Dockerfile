FROM node:18-alpine AS angular

WORKDIR /app

COPY . .
RUN yarn install

RUN yarn build -- --configuration=development --output-path=./dist/browser

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Angular application from the build stage to Nginx's HTML directory
# Adjust 'your-angular-project-name' if you used a specific output path above.
COPY --from=angular /app/dist/myapp /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]