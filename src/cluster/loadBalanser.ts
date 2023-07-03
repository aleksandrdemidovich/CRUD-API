import * as http from 'http';
import * as os from 'os';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const availableParallelism = os.cpus().length - 1;

// Array to hold references to worker ports
const workerPorts: number[] = [];

// Create the load balancer server
const balancer = http.createServer((req, res) => {
  // Forward the request to the selected worker
  const workerPort = workerPorts.shift();
  if (workerPort) {
    workerPorts.push(workerPort);
    const proxyReq = http.request(
      {
        host: 'localhost',
        port: workerPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );

    req.pipe(proxyReq);
  } else {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end('Service Unavailable');
  }
});

// Start the load balancer server
balancer.listen(PORT, () => {
  console.log(`Load balancer started on port ${PORT}`);
});

// Create the worker processes
for (let i = 0; i < availableParallelism; i++) {
  const workerPort = Number(PORT) + i + 1;
  workerPorts.push(workerPort);
}

console.log('Worker ports:', workerPorts);
