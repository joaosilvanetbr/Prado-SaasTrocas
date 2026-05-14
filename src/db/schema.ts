import { pgTable, serial, text, real, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role').notNull(),
  setores: text('setores').notNull().default(''),
  created_at: timestamp('created_at').defaultNow(),
});

export const sectors = pgTable('sectors', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  comprador_id: integer('comprador_id').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
});

export const daily_reports = pgTable('daily_reports', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  valor_realizado: real('valor_realizado').notNull(),
  valor_meta: real('valor_meta').notNull(),
  sector_id: integer('sector_id').references(() => sectors.id).notNull(),
  created_at: timestamp('created_at').defaultNow(),
});