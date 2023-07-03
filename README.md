# Assignment: CRUD API

## Description

Your task is to implement simple CRUD API using in-memory database underneath.

## Technical requirements and implementation details see [here](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md)

## Setup

1. Run `npm i`

2. To customize the PORT please use `.env` file:

```bash
export PORT=9000
```

### `.env` file at the working dir will be used

If you run `node build/main-bundle.js`, your `.env` file should be in the root dir. If you change your dir to `build` and run `node main-bundle.js`, your `.env` file should be in the build dir.

## Run

Run `npm run start:dev` to run single thread in the Development mode

Run `npm run start:multi` to run load balancer in the Development mode

Run `npm run start:prod` to build single bundle js file and run in the Production mode

## Tests

Run `npm run test`
