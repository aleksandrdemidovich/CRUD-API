import { IncomingMessage, ServerResponse } from 'http';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController';

export function handleUsersRequest(req: IncomingMessage, res: ServerResponse): void {
  const { method, url } = req;

  if (method === 'GET' && url === '/api/users') {
    getUsers(req, res);
  } else if (method === 'GET' && url?.startsWith('/api/users/')) {
    getUserById(req, res);
  } else if (method === 'POST' && url === '/api/users') {
    createUser(req, res);
  } else if (method === 'PUT' && url?.startsWith('/api/users/')) {
    updateUser(req, res);
  } else if (method === 'DELETE' && url?.startsWith('/api/users/')) {
    deleteUser(req, res);
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
}

