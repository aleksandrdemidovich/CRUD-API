import cluster from 'cluster';
import http, { IncomingMessage, ServerResponse } from 'http';
import { availableParallelism } from 'os';
import { handleUsersRequest } from './routes/router';
import dotenv from 'dotenv';

dotenv.config();

export const runMulti = (port: number): any => {
  if (cluster.isPrimary) {
    process.on('uncaughtException', (error) => console.error(error.message));

    const workersCount = availableParallelism() - 1;
    if (workersCount === 0) {
      console.error("This server doesn't have a parallelism feature");
      process.exit();
    }

    const workerPorts: number[] = [];

    for (let i = 0; i < workersCount; i++) {
      const workerPort = port + 1 + i;

      cluster.fork({ WORKER_PORT: workerPort });
      workerPorts.push(workerPort);
    }

    let nextServer = 0;

    const loadBalancer = http.createServer((req, res) => {
      console.info(`Request ${req.method}: ${req.url} to Load Balancer`);

      nextServer = (nextServer % workersCount) + 1;
      const workerPort = port + nextServer;

      try {
        const connector = http.request(
          {
            hostname: 'localhost',
            port: workerPort,
            path: req.url,
            method: req.method,
            headers: req.headers,
          },
          (resp) => {
            res.writeHead(
              resp.statusCode ?? 200,
              resp.statusMessage,
              resp.headers,
            );
            resp.pipe(res);
          },
        );
        connector.on('error', (error) => {
          console.error(error.message);
          req.unpipe(connector);
        });

        console.info(`Forward request to worker on port ${workerPort}`);

        req.pipe(connector);
      } catch (error) {
        console.error(error);
      }
    });
    loadBalancer.on('error', (error) => {
      console.error(error.message);
    });

    loadBalancer.listen(port, () => {
      console.info(`Load Balancer is listening on port ${port}`);
    });
  } else {
    const childPort = parseInt(process.env.WORKER_PORT ?? '4001');
    const server = http.createServer(
      (req: IncomingMessage, res: ServerResponse) => {
        res.setHeader('Content-Type', 'application/json');
        handleUsersRequest(req, res);
      },
    );
    server.listen(childPort, () => {
      console.log(`Server is running on port ${childPort}`);
    });
  }
};

runMulti(Number(process.env.PORT));
