import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { AiSummaryDto } from './dto/ai-summary.dto';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('x-api-key')
  @ApiOperation({ summary: 'Registrar un nuevo lead' })
  @ApiResponse({ status: 201, description: 'Lead creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar leads con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Lista paginada de leads' })
  findAll(@Query() query: QueryLeadsDto) {
    return this.leadsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas generales de leads' })
  @ApiResponse({ status: 200, description: 'Estadísticas calculadas' })
  getStats() {
    return this.leadsService.getStats();
  }

  @Post('ai/summary')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('x-api-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generar resumen ejecutivo con IA' })
  @ApiResponse({ status: 200, description: 'Resumen generado por LLM' })
  getAiSummary(@Body() dto: AiSummaryDto) {
    return this.leadsService.getAiSummary(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un lead por ID' })
  @ApiResponse({ status: 200, description: 'Lead encontrado' })
  @ApiResponse({ status: 404, description: 'Lead no encontrado' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('x-api-key')
  @ApiOperation({ summary: 'Actualizar campos de un lead' })
  @ApiResponse({ status: 200, description: 'Lead actualizado' })
  @ApiResponse({ status: 404, description: 'Lead no encontrado' })
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('x-api-key')
  @ApiOperation({ summary: 'Eliminar un lead (soft delete)' })
  @ApiResponse({ status: 200, description: 'Lead eliminado' })
  @ApiResponse({ status: 404, description: 'Lead no encontrado' })
  remove(@Param('id') id: string) {
    return this.leadsService.softDelete(id);
  }
}
