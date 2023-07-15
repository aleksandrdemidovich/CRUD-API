export type DbOperation =
  | 'find'
  | 'findOneById'
  | 'createOne'
  | 'updateOne'
  | 'removeOne';

export interface DbRequest {
  operation: DbOperation;
  data?: User | string;
}

export interface DbResponse {
  ok: boolean;
  operation: DbOperation;
  data?: User | User[];
}

export interface User extends Object {
  username: string;
  id?: string;
  age: number;
  hobbies: string[];
}
