VERSION 0.7
PROJECT ontola/atomic-server
FROM node:20.8.0-bookworm
WORKDIR browser

all:
  BUILD +build
  BUILD +test
  BUILD +lint
  BUILD +typedoc

deps:
  RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm
  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .
  COPY data-browser/package.json data-browser/.
  COPY lib/package.json lib/.
  COPY react/package.json react/.
  COPY svelte/package.json svelte/.
  COPY cli/package.json cli/.
  RUN pnpm install --frozen-lockfile --shamefully-hoist
  COPY . .

test:
  FROM +deps
  RUN pnpm run build
  RUN pnpm run test

lint:
  FROM +deps
  RUN pnpm run lint

build:
  FROM +deps
  RUN pnpm run build
  SAVE ARTIFACT ./data-browser/dist

typedoc:
  FROM +build
  RUN --secret NETLIFY_AUTH_TOKEN=NETLIFY_TOKEN pnpm run typedoc-publish
