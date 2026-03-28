import { PrismaClient, Fuente } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const leadsData = [
  {
    nombre: 'Ana Torres',
    email: 'ana.torres@gmail.com',
    telefono: '+57 300 111 2222',
    fuente: Fuente.instagram,
    productoInteres: 'Curso de Marketing Digital',
    presupuesto: 250,
  },
  {
    nombre: 'Carlos Mendez',
    email: 'carlosm@hotmail.com',
    telefono: '+57 310 333 4444',
    fuente: Fuente.facebook,
    productoInteres: 'Membresía Premium',
    presupuesto: 150,
  },
  {
    nombre: 'Valentina Ríos',
    email: 'vrios@empresa.co',
    telefono: '+57 315 555 6666',
    fuente: Fuente.landing_page,
    productoInteres: 'Ebook de Ventas',
    presupuesto: 50,
  },
  {
    nombre: 'Juan Pablo Gómez',
    email: 'jpgomez@correo.com',
    telefono: null,
    fuente: Fuente.referido,
    productoInteres: 'Consultoría 1:1',
    presupuesto: 500,
  },
  {
    nombre: 'María Fernanda Castillo',
    email: 'mfcastillo@gmail.com',
    telefono: '+57 320 777 8888',
    fuente: Fuente.instagram,
    productoInteres: 'Curso de Copywriting',
    presupuesto: 300,
  },
  {
    nombre: 'Sergio Vargas',
    email: 'svargas@negocios.net',
    telefono: '+57 300 999 0000',
    fuente: Fuente.facebook,
    productoInteres: null,
    presupuesto: null,
  },
  {
    nombre: 'Laura Quintero',
    email: 'lauraq@email.com',
    telefono: null,
    fuente: Fuente.landing_page,
    productoInteres: 'Taller de Embudos',
    presupuesto: 200,
  },
  {
    nombre: 'Andrés Felipe Mora',
    email: 'afmora@startup.io',
    telefono: '+57 318 111 2222',
    fuente: Fuente.otro,
    productoInteres: 'Acceso a Comunidad',
    presupuesto: 80,
  },
  {
    nombre: 'Daniela Ospina',
    email: 'dospina@mail.com',
    telefono: '+57 311 333 4444',
    fuente: Fuente.referido,
    productoInteres: 'Mentoría Grupal',
    presupuesto: 400,
  },
  {
    nombre: 'Roberto Salazar',
    email: 'rsalazar@biz.com',
    telefono: '+57 312 555 6666',
    fuente: Fuente.instagram,
    productoInteres: 'Curso de Automatización',
    presupuesto: 350,
  },
  {
    nombre: 'Paola Herrera',
    email: 'pherrera@works.co',
    telefono: null,
    fuente: Fuente.facebook,
    productoInteres: 'Webinar Gratuito',
    presupuesto: 0,
  },
  {
    nombre: 'Esteban Cruz',
    email: 'ecruz@digital.com',
    telefono: '+57 316 777 8888',
    fuente: Fuente.landing_page,
    productoInteres: 'Pack Completo de Cursos',
    presupuesto: 700,
  },
];

async function main() {
  console.log('🚀 Iniciando seeding...');

  // Limpiar tabla antes de seed
  await prisma.lead.deleteMany({});

  for (const lead of leadsData) {
    const created = await prisma.lead.create({ data: lead });
    console.log(`  ✅ Lead creado: ${created.nombre} (${created.email})`);
  }

  console.log(`\n🎉 Seed completado: ${leadsData.length} leads insertados.`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
