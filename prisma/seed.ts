import 'dotenv/config';
import { PrismaClient, Fuente } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const nombres = [
  'Ana',
  'Carlos',
  'David',
  'Laura',
  'María',
  'Jorge',
  'Sofía',
  'Daniel',
  'Valentina',
  'Andrés',
];
const apellidos = [
  'García',
  'Martínez',
  'López',
  'González',
  'Pérez',
  'Rodríguez',
  'Gómez',
  'Fernández',
  'Díaz',
  'Torres',
];
const productos = [
  'Curso de Marketing',
  'Diplomado en IA',
  'Maestría en Ventas',
  'Taller de Finanzas',
  'Asesoría Empresarial',
];
const fuentes = Object.values(Fuente);

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPhoneNumber(): string {
  const prefix = getRandomElement(['+57', '+52', '+34', '+1', '+54']);
  const number = Math.floor(Math.random() * 9000000000) + 1000000000;
  return `${prefix} ${number}`;
}

function getRandomPresupuesto(): number | null {
  if (Math.random() < 0.2) return null;
  return Math.floor(Math.random() * 98 + 2) * 50;
}

async function main() {
  console.log('🌱 Iniciando la creación de leads de prueba...');

  const leadsData = Array.from({ length: 50 }).map((_, index) => {
    const nombre = `${getRandomElement(nombres)} ${getRandomElement(apellidos)}`;
    const email = `lead_test_${Date.now()}_${index}@example.com`;
    const telefono = getRandomPhoneNumber();
    const fuente = getRandomElement(fuentes);
    const productoInteres =
      Math.random() < 0.8 ? getRandomElement(productos) : null;
    const presupuesto = getRandomPresupuesto();

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

    return {
      nombre,
      email,
      telefono,
      fuente,
      productoInteres,
      presupuesto,
      createdAt,
      updatedAt: createdAt,
    };
  });

  const createdLeads = await prisma.lead.createMany({
    data: leadsData,
  });

  console.log(
    `✅ ¡Se crearon ${createdLeads.count} leads de prueba con éxito!`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
