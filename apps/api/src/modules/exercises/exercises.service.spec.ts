import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesService } from './exercises.service';

describe('ExercisesService', () => {
  let service: ExercisesService;

  beforeEach(async () => {
    // Aquí es donde luego inyectaremos el PrismaMock
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ExercisesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of exercises (mocked)', async () => {
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
  });
});
