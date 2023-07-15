import { User } from '../db/dbTypes';
export const isUser = (arg: User): arg is User => {
  return (
    arg &&
    !!arg.username &&
    typeof arg.username === 'string' &&
    arg.age !== undefined &&
    typeof arg.age === 'number' &&
    Array.isArray(arg.hobbies) &&
    (!arg.hobbies.length || arg.hobbies.every((h) => typeof h === 'string'))
  );
};
