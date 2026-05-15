import RelatoriosClient from './RelatoriosClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Relatórios | Prado Trocas",
  description: "Relatórios históricos de trocas por setor.",
};

export default async function RelatoriosPage() {
  return <RelatoriosClient />;
}