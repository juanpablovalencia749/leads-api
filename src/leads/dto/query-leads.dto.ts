import { IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Fuente } from '@prisma/client';

export class QueryLeadsDto {
  @ApiPropertyOptional({ description: 'Número de página', default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Registros por página', default: 10, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

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
