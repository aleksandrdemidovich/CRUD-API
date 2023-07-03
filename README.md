# Assignment: CRUD API

## Description

Your task is to implement simple CRUD API using in-memory database underneath.

## Technical requirements and implementation details see [here](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md)

## Setup

1. Run `npm i`

2. To customize the PORT please use `.env` file:

```bash
export PORT=4000
```

3. To enable/disable "Parallelism" mode use `.env` file:

```bash
export MULTI=true/false
```

## Run

Run `npm run start:dev` to run single thread in the Development mode

Run `npm run start:multi` to run load balancer in the Development mode

Run `npm run start:prod` to build single bundle js file and run in the Production mode

## Tests

Run `npm run test`
