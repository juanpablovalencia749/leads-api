import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Fuente } from '@prisma/client';

export { Fuente };

export class CreateLeadDto {
  @ApiProperty({ description: 'Nombre completo del lead', example: 'Ana Torres', minLength: 2 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nombre: string;

  @ApiProperty({ description: 'Email del lead (único)', example: 'ana@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Teléfono opcional', example: '+57 300 111 2222' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({
    description: 'Canal de origen del lead',
    enum: Fuente,
    example: Fuente.instagram,
  })
  @IsEnum(Fuente, {
    message: `fuente debe ser uno de: ${Object.values(Fuente).join(', ')}`,
  })
  fuente: Fuente;

  @ApiPropertyOptional({ description: 'Producto de interés', example: 'Curso de Marketing' })
  @IsOptional()
  @IsString()
  productoInteres?: string;

  @ApiPropertyOptional({ description: 'Presupuesto en USD', example: 250 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  presupuesto?: number;
}
