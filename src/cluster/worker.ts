import * as http from 'http';
import { handleUsersRequest } from '../routes/router';
import dotenv from 'dotenv';

dotenv.config();

const server = http.createServer((req, res) => {
  console.log(`Worker ${process.pid} received request`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  handleUsersRequest(req, res);
});

const PORT = 4001;
server.listen(PORT, () => {
  console.log(`Worker ${process.pid} is listening on port ${PORT}`);
});
