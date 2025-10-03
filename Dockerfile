FROM node:18-alpine AS builder

WORKDIR /app

ENV CI=1

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

ARG BUILD_CONFIGURATION=production
RUN yarn build -- --configuration=$BUILD_CONFIGURATION

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/myapp /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]