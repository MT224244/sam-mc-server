FROM --platform=linux/arm64 oven/bun:latest

WORKDIR /app

COPY ./src ./src
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json

RUN bun i

CMD ["bun", "start"]
