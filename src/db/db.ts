import { v4 } from 'uuid';

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

export { find, findOneById, createOne, updateOne, removeOne };
