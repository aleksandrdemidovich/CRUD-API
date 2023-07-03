import { v4 } from 'uuid';
import cluster, { Worker } from 'cluster';

interface DbOperation {
  type: 'find' | 'findOneById' | 'createOne' | 'updateOne' | 'removeOne';
  data?: any;
}

interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[] | [];
}

const users: User[] = [];

function find(): User[] {
  return users;
}

function findOneById(userId: string): User | undefined {
  return users.find((user) => user.id === userId);
}

function createOne(username: string, age: number, hobbies: string[]): User {
  const id = v4();
  const newUser = { id, username, age, hobbies };
  users.push(newUser);
  return newUser;
}

function updateOne(
  userId: string,
  username: string,
  age: number,
  hobbies: string[],
): User | undefined {
  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    const updatedUser: User = { id: userId, username, age, hobbies };
    users[userIndex] = updatedUser;
    return updatedUser;
  }
  return undefined;
}

function removeOne(userId: string): boolean {
  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    return true;
  }
  return false;
}

if (cluster.isPrimary) {
  cluster.on('message', (worker: Worker, message: DbOperation) => {
    switch (message.type) {
      case 'find':
        worker.send({ type: 'find', data: users });
        break;
      case 'findOneById':
        const user = findOneById(message.data);
        worker.send({ type: 'findOneById', data: user });
        break;
      case 'createOne':
        const newUser = createOne(
          message.data.username,
          message.data.age,
          message.data.hobbies,
        );
        worker.send({ type: 'createOne', data: newUser });
        break;
      case 'updateOne':
        const updatedUser = updateOne(
          message.data.id,
          message.data.username,
          message.data.age,
          message.data.hobbies,
        );
        worker.send({ type: 'updateOne', data: updatedUser });
        break;
      case 'removeOne':
        const isDeleted = removeOne(message.data);
        worker.send({ type: 'removeOne', data: isDeleted });
        break;
    }
  });

  cluster.on('exit', (worker: Worker, _code: number, _signal: string) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
}

export { find, findOneById, createOne, updateOne, removeOne };
