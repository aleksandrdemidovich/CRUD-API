import dotenv from 'dotenv';
dotenv.config();
import http, { IncomingMessage, ServerResponse } from 'http';
import { handleUsersRequest } from './routes/router';

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Content-Type', 'application/json');
    handleUsersRequest(req, res);
  },
);

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
