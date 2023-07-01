import http, { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import { handleUsersRequest } from './routes/router';

dotenv.config();

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Content-Type', 'application/json');
    handleUsersRequest(req, res);
  },
);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
