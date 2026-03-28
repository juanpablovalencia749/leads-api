import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Fuente } from '@prisma/client';

export class AiSummaryDto {
  @ApiPropertyOptional({ description: 'Filtrar por fuente', enum: Fuente })
  @IsOptional()
  @IsEnum(Fuente)
  fuente?: Fuente;

  @ApiPropertyOptional({ description: 'Fecha de inicio (ISO 8601)', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin (ISO 8601)', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
