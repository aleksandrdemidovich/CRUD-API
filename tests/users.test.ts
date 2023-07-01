import supertest from 'supertest';
import server from '../src/index';
import { validate } from 'uuid';

describe('Users API', () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeEach(() => {
    request = supertest(server);
  });

  describe('GET /api/users', () => {
    test('should return an empty array', async () => {
      const response = await request.get('/api/users');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('should return an array with one user', async () => {
      const user = {
        username: 'TestUser',
        age: 25,
        hobbies: ['Test', 'hobbies'],
      };
      const response = await request.post('/api/users').send(user);
      const { username, age, hobbies, id } = response.body;

      const responseGet = await request.get('/api/users');
      expect(responseGet.status).toBe(200);
      expect(responseGet.body).toEqual([
        {
          id,
          username,
          age,
          hobbies,
        },
      ]);
    });
  });

  test('should create a new user', async () => {
    const user = {
      username: 'TestUser',
      age: 25,
      hobbies: ['Test', 'hobbies'],
    };

    const response = await request.post('/api/users').send(user);
    const { username, age, hobbies } = response.body;

    expect(response.status).toBe(201);
    expect(username).toEqual('TestUser');
    expect(age).toEqual(25);
    expect(hobbies).toEqual(['Test', 'hobbies']);
  });

  test('should get a user by ID', async () => {
    const user = {
      username: 'TestUser',
      age: 25,
      hobbies: ['Test', 'hobbies'],
    };

    const responseCreatedUser = await request.post('/api/users').send(user);

    const response = await request.get(
      `/api/users/${responseCreatedUser.body.id}`,
    );
    expect(response.status).toBe(200);
    expect(validate(response.body.id)).toBe(true);
    expect(response.body.id).toBe(responseCreatedUser.body.id);
  });

  test('should update a user', async () => {
    const user = {
      username: 'TestUser',
      age: 25,
      hobbies: ['Test', 'hobbies'],
    };
    const updatedUser = {
      username: 'UpdatedUser',
      age: 26,
      hobbies: ['Updated', 'hobbies'],
    };

    const responseCreatedUser = await request.post('/api/users').send(user);

    const responseUpdatedUser = await request
      .put(`/api/users/${responseCreatedUser.body.id}`)
      .send(updatedUser);
    const { username, age, hobbies } = responseUpdatedUser.body;

    expect(responseUpdatedUser.status).toBe(200);
    expect(username).toEqual('UpdatedUser');
    expect(age).toEqual(26);
    expect(hobbies).toEqual(['Updated', 'hobbies']);
  });

  it('should delete a user', async () => {
    const user = {
      username: 'TestUser',
      age: 25,
      hobbies: ['Test', 'hobbies'],
    };
    const responseCreatedUser = await request.post('/api/users').send(user);

    const response = await request.delete(
      `/api/users/${responseCreatedUser.body.id}`,
    );
    expect(response.status).toBe(204);
    expect(response.body).toBe('');
  });
});
