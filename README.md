# UniLib
## About
App for storing your lists of series, books, anime or games.

## Structure
```
uni-lib/
├──server/                    # backend - fastapi
│  ├──src/
│  ├──Dockerfile.dev
│  └──Dockerfile.prod
├──app/                       # frontend - react
│  ├──src/
│  ├──Dockerfile.dev
│  ├──Dockerfile.prod
├──.env.dev                   # environment variables: dev/prod
├──.env.prod
├──docker-compose.dev.yml     # docker compose modes: dev/prod
└──docker-compose.prod.yml
```
## How to start with Docker
Start development mode:
```bash
cd path_to_repo/uni-lib
docker-compose -f docker-compose.dev.yml --env-file .env.dev up
```

Start production mode:
```bash
cd path_to_repo/uni-lib
docker-compose -f docker-compose.prod.yml --env-file .env.prod up
```