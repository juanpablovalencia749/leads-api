import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Fuente } from '@prisma/client';

const mockPrisma = {
  lead: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockAiService = {
  generateSummary: jest.fn().mockResolvedValue({
    resumen: '[MOCK] Resumen de prueba',
    modo: 'mock',
    filtrosAplicados: {},
  }),
};

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

describe('LeadsService', () => {
  let service: LeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a lead when email is unique', async () => {
      const dto = {
        nombre: 'Ana Torres',
        email: 'ana@test.com',
        fuente: Fuente.instagram,
        presupuesto: 250,
      };

      mockPrisma.lead.findUnique.mockResolvedValue(null);
      mockPrisma.lead.create.mockResolvedValue(makeLead());

      const result = await service.create(dto);

      expect(mockPrisma.lead.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(mockPrisma.lead.create).toHaveBeenCalledTimes(1);
      expect(result.email).toBe('ana@test.com');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(makeLead());

      await expect(
        service.create({
          nombre: 'Ana Torres',
          email: 'ana@test.com',
          fuente: Fuente.instagram,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated leads with correct meta', async () => {
      const leads = [
        makeLead(),
        makeLead({ id: 'cuid-002', email: 'b@b.com' }),
      ];
      mockPrisma.lead.findMany.mockResolvedValue(leads);
      mockPrisma.lead.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('getStats', () => {
    it('should return stats object with correct shape', async () => {
      mockPrisma.lead.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3); // ultimos7dias

      mockPrisma.lead.groupBy.mockResolvedValue([
        { fuente: Fuente.instagram, _count: { fuente: 5 } },
        { fuente: Fuente.facebook, _count: { fuente: 3 } },
      ]);

      mockPrisma.lead.aggregate.mockResolvedValue({
        _avg: { presupuesto: 275.5 },
      });

      const stats = await service.getStats();

      expect(stats).toHaveProperty('total', 10);
      expect(stats).toHaveProperty('ultimos7dias', 3);
      expect(stats).toHaveProperty('promedioPres', 275.5);
      expect(stats.porFuente).toHaveLength(2);
      expect(stats.porFuente[0]).toEqual({
        fuente: Fuente.instagram,
        cantidad: 5,
      });
    });
  });

  describe('softDelete', () => {
    it('should throw NotFoundException when lead does not exist', async () => {
      mockPrisma.lead.findFirst.mockResolvedValue(null);

      await expect(service.softDelete('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should soft-delete an existing lead by setting deletedAt', async () => {
      const lead = makeLead();
      mockPrisma.lead.findFirst.mockResolvedValue(lead);
      mockPrisma.lead.update.mockResolvedValue({
        ...lead,
        deletedAt: new Date(),
      });

      const result = await service.softDelete('cuid-001');

      expect(result.deletedAt).not.toBeNull();
      expect(mockPrisma.lead.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'cuid-001' } }),
      );
    });
  });
});
