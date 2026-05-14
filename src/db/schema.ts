import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role').notNull(),
  setores: text('setores'),
});

export const sectors = sqliteTable('sectors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  comprador_id: integer('comprador_id').references(() => users.id),
});

export const daily_reports = sqliteTable('daily_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  valor_realizado: real('valor_realizado').notNull(),
  valor_meta: real('valor_meta').notNull(),
  sector_id: integer('sector_id').references(() => sectors.id).notNull(),
});
