import { db } from '@/db';
import { users, sectors } from '@/db/schema';
import bcrypt from 'bcryptjs';

const sectorsData = [
  { nome: 'Açougue', meta: 3000 },
  { nome: 'Bebidas', meta: 7000 },
  { nome: 'Petshop', meta: 2000 },
  { nome: 'Higiene', meta: 3500 },
  { nome: 'Mercearia', meta: 10000 },
  { nome: 'Padaria', meta: 2500 },
  { nome: 'Hortifruti', meta: 4000 },
];

async function seed() {
  console.log('Starting seed...');

  const passwordHash = await bcrypt.hash('160922', 10);

  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.nome, 'Comercial.Cadastro'),
  });

  if (!existingUser) {
    await db.insert(users).values({
      nome: 'Comercial.Cadastro',
      password_hash: passwordHash,
      role: 'admin',
      setores: '',
    });
    console.log('Admin user created: Comercial.Cadastro');
  } else {
    console.log('Admin user already exists');
  }

  for (const sector of sectorsData) {
    const existingSector = await db.query.sectors.findFirst({
      where: (sectors, { eq }) => eq(sectors.nome, sector.nome),
    });

    if (!existingSector) {
      await db.insert(sectors).values({
        nome: sector.nome,
        meta: sector.meta,
      });
      console.log(`Sector created: ${sector.nome}`);
    } else {
      console.log(`Sector already exists: ${sector.nome}`);
    }
  }

  console.log('Seed completed!');
}

seed().catch(console.error);