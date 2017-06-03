# ICO Helper for Token Hackathon

TODO
- ICO Index Bot
- 一键参投
- 资金流分析

## Running locally

- Install and run docker
- `yarn`
- Amend `docker-compose-dev.yml` with your own TOKEN_APP_SEED, generate it [here](https://www.tokenbrowser.com/token-seed-generator/) and update your own app name and user name, make sure no others using it.
- `yarn dev`

If any new depencies are added you can rebuild the project with

```
yarn build
```

To reset the postgres database in your dev environment you can use

```
yarn reset
```

## Architecture

Deploying a Token app requires a few processes to run:
* **token-headless-client**<br>
  This is a client we provide (similar to the iOS or Android client) that provides a wrapper around the Token backend services. It also handles end-to-end encrypting all messages using the Signal protocol. It is written in Java and runs in the background, proxying all the requests to amd from your bot.
* **redis**<br>
  We use redis pub/sub to provide a connection between the token-headless-client and your bot.
* **bot.js**<br>
  This is where all your app logic lives.
* **postgres**<br>
  Postgres is used to store session data so you can persist state for each user who talks to your bot (similar to cookies in a web browser).

![diagram](docs/images/app-architecture.png)
