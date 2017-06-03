# ICO Helper for Token Hackathon

TODO
- ICO Index Bot
- 一键参投
- 资金流分析

## Running locally

#### Prepare:
- Install and run docker
- `yarn`
- `cd src/client && yarn`
- Amend `docker-compose-dev.yml` with your own TOKEN_APP_SEED, generate it [here](https://www.tokenbrowser.com/token-seed-generator/) and update your own app name and user name, make sure no others using it.

#### Start Dev:
- `yarn start-bot: up docker for local bot dev`
- `yarn start-web: Express backend at http://localhost:3001 and React frontend at http://localhost:3000`

#### After Dev:
To reset the postgres database for bot:
```
yarn reset
```
Build web-client before push:
```
cd src/client && yarn build
```
Test web after build:
```
yarn serve-prod
```

## Architecture

#### Bot:
* **token-headless-client**<br>
  This is a client we provide (similar to the iOS or Android client) that provides a wrapper around the Token backend services. It also handles end-to-end encrypting all messages using the Signal protocol. It is written in Java and runs in the background, proxying all the requests to amd from your bot.
* **redis**<br>
  We use redis pub/sub to provide a connection between the token-headless-client and your bot.
* **bot.js**<br>
  This is where all your app logic lives.
* **postgres**<br>
  Postgres is used to store session data so you can persist state for each user who talks to your bot (similar to cookies in a web browser).

![diagram](docs/images/tokenbot.png)

##### Web:
* **Node & Express as API server**<br>
* **React frontend**<br>

![diagram](docs/images/web.png)
