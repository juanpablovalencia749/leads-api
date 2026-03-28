import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { AiService } from '../ai/ai.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async create(dto: CreateLeadDto) {
    const existing = await this.prisma.lead.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un lead con el email "${dto.email}"`,
      );
    }

    return this.prisma.lead.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        telefono: dto.telefono ?? null,
        fuente: dto.fuente,
        productoInteres: dto.productoInteres ?? null,
        presupuesto: dto.presupuesto ?? null,
      },
    });
  }

  async findAll(query: QueryLeadsDto) {
    const { page = 1, limit = 10, fuente, fechaInicio, fechaFin } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      deletedAt: null,
      ...(fuente && { fuente }),
      ...(fechaInicio || fechaFin
        ? {
            createdAt: {
              ...(fechaInicio && { gte: new Date(fechaInicio) }),
              ...(fechaFin && { lte: new Date(fechaFin + 'T23:59:59.999Z') }),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });

    if (!lead) {
      throw new NotFoundException(`Lead con id "${id}" no encontrado`);
    }

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
    await this.findOne(id);

    if (dto.email) {
      const conflict = await this.prisma.lead.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(
          `El email "${dto.email}" ya está en uso por otro lead`,
        );
      }
    }

    return this.prisma.lead.update({
      where: { id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre }),
        ...(dto.email && { email: dto.email }),
        ...(dto.telefono !== undefined && { telefono: dto.telefono }),
        ...(dto.fuente && { fuente: dto.fuente }),
        ...(dto.productoInteres !== undefined && {
          productoInteres: dto.productoInteres,
        }),
        ...(dto.presupuesto !== undefined && { presupuesto: dto.presupuesto }),
      },
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);

    return this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getStats() {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [total, porFuente, presupuestoAgg, ultimos7dias] = await Promise.all([
      this.prisma.lead.count({ where: { deletedAt: null } }),

      this.prisma.lead.groupBy({
        by: ['fuente'],
        where: { deletedAt: null },
        _count: { fuente: true },
      }),

      this.prisma.lead.aggregate({
        where: { deletedAt: null, presupuesto: { not: null } },
        _avg: { presupuesto: true },
      }),

      this.prisma.lead.count({
        where: {
          deletedAt: null,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    return {
      total,
      porFuente: porFuente.map((item) => ({
        fuente: item.fuente,
        cantidad: item._count.fuente,
      })),
      promedioPres: presupuestoAgg._avg.presupuesto ?? 0,
      ultimos7dias,
    };
  }

  async getAiSummary(filter: {
    fuente?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }) {
    const queryFilter: QueryLeadsDto = {
      page: 1,
      limit: 100,
      ...(filter.fuente && { fuente: filter.fuente as any }),
      ...(filter.fechaInicio && { fechaInicio: filter.fechaInicio }),
      ...(filter.fechaFin && { fechaFin: filter.fechaFin }),
    };

    const { data: leads } = await this.findAll(queryFilter);
    return this.aiService.generateSummary(leads, filter);
  }
}
