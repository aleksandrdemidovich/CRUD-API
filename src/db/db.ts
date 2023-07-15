import cluster from 'cluster';
import { version as uuidVersion, validate as uuidValidate, v4 } from 'uuid';
import { DbRequest, DbResponse, User, DbOperation } from './dbTypes';
import { isUser } from '../utils/userUtils';

let users: User[] = [];
const multi = JSON.parse(process.env.MULTI ?? 'true');

const isDbRequest = (message: DbRequest): message is DbRequest => {
  return (
    !!message &&
    !!message.operation &&
    typeof message.operation === 'string' &&
    (message.data === undefined ||
      typeof message.data === 'string' ||
      isUser(message.data))
  );
};

const isDbResponse = (message: DbResponse): message is DbResponse => {
  return (
    message &&
    !!message.operation &&
    typeof message.operation === 'string' &&
    (message.data === undefined ||
      message.data instanceof Object ||
      typeof message.data === 'string')
  );
};

if (multi && cluster.isPrimary) {
  cluster.on('message', (worker, message: DbRequest, _handle) => {
    if (!isDbRequest(message)) {
      return;
    }

    const { operation, data } = message;
    switch (operation) {
      case 'find':
        worker.send({ ok: true, operation, data: users });
        break;
      case 'findOneById':
        if (
          typeof data === 'string' &&
          uuidValidate(data) &&
          uuidVersion(data) === 4
        ) {
          worker.send({
            ok: true,
            operation,
            data: users.find((u) => u.id === data),
          });
        } else {
          worker.send({ ok: false, operation });
        }
        break;
      case 'createOne':
        if (data === undefined || typeof data === 'string' || !isUser(data)) {
          worker.send({ ok: false, operation });
          return;
        }
        const user = { id: v4(), ...data };
        users = [...users, user];
        worker.send({ ok: true, operation, data: user });
        break;
      case 'updateOne':
        if (data === undefined || typeof data === 'string' || !isUser(data)) {
          worker.send({ ok: false, operation });
          return;
        }
        if (!users.find((value) => value.id === data.id)) {
          worker.send({ ok: false, operation });
          return;
        }
        users = [...users.filter((value) => value.id !== data.id), data];
        worker.send({ ok: true, operation, data });
        break;
      case 'removeOne':
        users = users.filter((value) => value.id !== data);
        worker.send({ ok: true, operation });
        break;

      default:
        worker.send({ ok: false, operation });
        break;
    }
  });
}

export const find = async () => {
  if (multi) {
    return performDbOperation<User[]>('find');
  }
  return users;
};

export const findOneById = async (id: string) => {
  if (multi) {
    return performDbOperation<User>('findOneById', id);
  }
  return users.find((u) => u.id === id);
};

export const createOne = async (user: User) => {
  if (multi) {
    return performDbOperation<User>('createOne', user);
  }
  const newUser = {
    id: v4(),
    ...user,
  };
  users = [...users, newUser];
  return newUser;
};

export const updateOne = async (user: User) => {
  if (multi) {
    return performDbOperation<User>('updateOne', user);
  }
  if (users.find((value) => value.id === user.id)) {
    users = [...users.filter((value) => value.id !== user.id), user];
    return user;
  } else {
    return false;
  }
};

export const removeOne = async (id: string) => {
  if (multi) {
    return performDbOperation('removeOne', id);
  }
  if (users.find((value) => value.id === id)) {
    users = users.filter((value) => value.id !== id);
  } else {
    return false;
  }
  return true;
};

const performDbOperation = <User>(
  operation: DbOperation,
  data?: User | string,
): Promise<unknown> => {
  if (cluster.isPrimary) {
    throw new Error(
      'DB operations should be called only from Workers, not from Primary thread',
    );
  }
  return new Promise((resolve, _reject) => {
    const listener = (message: any) => {
      if (!isDbResponse(message)) {
        return;
      }
      resolve(message.data);
      process.removeListener('message', listener);
    };
    process.addListener('message', listener);
    process.send?.({ operation, data });
  });
};

export default {
  find,
  findOneById,
  createOne,
  updateOne,
  removeOne,
};
