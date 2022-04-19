FROM node:16.14.2
WORKDIR /app
COPY package.json .
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
    then npm install; \
    else npm install --only=production; \
    fi

COPY ./src ./
ENV PORT 3000
CMD ["node", "index.js"]