import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { Fuente } from '@prisma/client';

const makeLead = (overrides = {}) => ({
  id: 'cuid-001',
  nombre: 'Ana Torres',
  email: 'ana@test.com',
  telefono: null,
  fuente: Fuente.instagram,
  productoInteres: 'Curso',
  presupuesto: 250,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('AiService', () => {
  let service: AiService;
  const originalKey = process.env.OPENAI_API_KEY;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
    delete process.env.OPENAI_API_KEY;
  });

  afterAll(() => {
    if (originalKey) process.env.OPENAI_API_KEY = originalKey;
  });

  it('should return a mock summary when OPENAI_API_KEY is not set', async () => {
    const leads = [
      makeLead({ fuente: Fuente.instagram }),
      makeLead({ id: 'cuid-002', email: 'b@b.com', fuente: Fuente.facebook }),
    ];

    const result = await service.generateSummary(leads, {
      fuente: 'instagram',
    });

    expect(result.modo).toBe('mock');
    expect(result.resumen).toContain('[MOCK');
    expect(result.filtrosAplicados).toMatchObject({ fuente: 'instagram' });
  });

  it('should return empty-leads mock when leads array is empty', async () => {
    const result = await service.generateSummary([], {});

    expect(result.modo).toBe('mock');
    expect(result.resumen).toContain('No se encontraron leads');
  });
});
