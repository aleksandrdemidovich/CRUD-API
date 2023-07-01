import supertest from 'supertest';
import server from '../src/index';
import { validate, v4 } from 'uuid';

describe('Users API', () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(() => {
    request = supertest(server);
  });
  afterAll(() => {
    server.close();
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

    test('should return error if path is invalid', async () => {
      const response = await request.get('/api/user');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Endpoint not found');
    });
  });

  describe('POST /api/users', () => {
    test('should create a new user', async () => {
      const user = {
        username: 'TestUser',
        age: 25,
        hobbies: ['Test', 'hobbies'],
      };
      const response = await request.post('/api/users').send(user);
      const { username, age, hobbies, id } = response.body;
      expect(response.body).toStrictEqual({
        id,
        username,
        age,
        hobbies,
      });
    });

    test('should not create a new user with invalid data (missed required fields)', async () => {
      const user = {
        username: 'TestUser',
        age: 25,
      };
      const response = await request.post('/api/users').send(user);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields');
    });

    test('should not create a new user with invalid data (invalid type)', async () => {
      const user = {
        username: 'TestUser',
        age: '25',
        hobbies: ['Test', 34, { test: 'test' }],
      };
      const response = await request.post('/api/users').send(user);
      expect(response.status).toBe(400);
      expect(response.body.error.age).toBe('Age must be a number');
      expect(response.body.error.hobbies).toBe(
        'Hobbies must be an array of strings or empty',
      );
    });
  });

  describe('GET /api/users/:id', () => {
    test('should get a user by ID', async () => {
      const user = {
        username: 'TestUser',
        age: 25,
        hobbies: ['Test', 'hobbies'],
      };
      const createdUser = await request.post('/api/users').send(user);
      const response = await request.get(`/api/users/${createdUser.body.id}`);
      const { username, age, hobbies, id } = response.body;

      expect(response.status).toBe(200);
      expect(validate(response.body.id)).toBe(true);
      expect(response.body).toStrictEqual({
        id,
        username,
        age,
        hobbies,
      });
    });

    test('should not get a user (user not found)', async () => {
      const id = v4();
      const response = await request.get(`/api/users/${id}`);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    test('should not get a user by invalid ID (not uuid)', async () => {
      const response = await request.get('/api/users/123');
      expect(response.status).toBe(400);
    });

    test('should not get a user after it has been deleted', async () => {
      const user = {
        username: 'TestUser',
        age: 25,
        hobbies: ['Test', 'hobbies'],
      };
      const createdUser = await request.post('/api/users').send(user);

      await request.delete(`/api/users/${createdUser.body.id}`);

      const response = await request.get(`/api/users/${createdUser.body.id}`);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    test('should update a user correctly', async () => {
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

      const createdUser = await request.post('/api/users').send(user);
      const responseUpdatedUser = await request
        .put(`/api/users/${createdUser.body.id}`)
        .send(updatedUser);

      expect(responseUpdatedUser.status).toBe(200);
      expect(responseUpdatedUser.body).toStrictEqual({
        ...updatedUser,
        id: createdUser.body.id,
      });
    });

    test('should not update a user (user not found)', async () => {
      const updatedUser = {
        username: 'UpdatedUser',
        age: 26,
        hobbies: ['Updated', 'hobbies'],
      };
      const id = v4();
      const response = await request.put(`/api/users/${id}`).send(updatedUser);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    test('should not update a user (invalid request body)', async () => {
      const user = {
        username: 'TestUser',
        age: 25,
        hobbies: ['Test', 'hobbies'],
      };
      const updatedUser = {
        username: 'TestUser',
        age: '25',
        hobbies: ['Test', 34, { test: 'test' }],
      };
      const createdUser = await request.post('/api/users').send(user);
      const responseUpdatedUser = await request
        .put(`/api/users/${createdUser.body.id}`)
        .send(updatedUser);

      expect(responseUpdatedUser.status).toBe(404);
      expect(responseUpdatedUser.body.error.hobbies).toBe(
        'Hobbies must be an array of strings or empty',
      );
      expect(responseUpdatedUser.body.error.age).toBe('Age must be a number');
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should delete a user', async () => {
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
    test('should not delete a user (user not found)', async () => {
      const id = v4();
      const response = await request.delete(`/api/users/${id}`);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
    test('should not delete a user (invalid ID)', async () => {
      const response = await request.delete('/api/users/123');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User ID is invalid (not uuid)');
    });
  });
});
