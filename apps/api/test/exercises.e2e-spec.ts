import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ExercisesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/exercises (GET)', () => {
    return request(app.getHttpServer())
      .get('/exercises')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/exercises (POST)', () => {
    return request(app.getHttpServer())
      .post('/exercises')
      .send({ name: 'Test Exercise E2E', equipment: 'Barra' })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toEqual('Test Exercise E2E');
      });
  });
});
