'use server';

import { db } from '@/db';
import { users, sectors } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { getJwtSecret } from '@/lib/env';
import { sanitizeString, isSafeString } from '@/lib/sanitize';

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const createUserSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100),
  role: z.string().min(1, 'Cargo é obrigatório'),
  setores: z.string().default(''),
});

const updateUserSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100).optional(),
  role: z.enum(['admin', 'gerente', 'comprador']).optional(),
  setores: z.string().optional(),
  ativo: z.boolean().optional(),
});

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres').max(100),
});

// Helper to get current user ID from JWT
async function getCurrentUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const { jwtVerify } = await import('jose');
    const verified = await jwtVerify(token, getJwtSecret());
    const payload = verified.payload as { sub?: string };
    return payload?.sub ? parseInt(payload.sub) : null;
  } catch {
    return null;
  }
}

// Helper to refresh JWT token
async function refreshUserToken(userId: number) {
  const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userList.length === 0) return;
  
  const user = userList[0];
  const roles = (user.role || '').split(',').map((r: string) => r.trim()).filter(Boolean);
  const setores = (user.setores || '').split(',').filter(Boolean).map(Number);
  
  const token = await new SignJWT({
    sub: user.id.toString(),
    nome: user.nome,
    roles,
    setores,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(getJwtSecret());
  
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
}

export async function getCurrentUserAction() {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Não autenticado' };
  
  try {
    const userList = await db.select({
      id: users.id,
      nome: users.nome,
      role: users.role,
      setores: users.setores,
      created_at: users.created_at,
    }).from(users).where(eq(users.id, userId)).limit(1);
    
    if (userList.length === 0) return { error: 'Usuário não encontrado' };
    
    const user = userList[0];
    const roles = (user.role || '').split(',').map((r: string) => r.trim()).filter(Boolean);
    const setoresArray = (user.setores || '').split(',').filter(Boolean).map(Number);
    
    return { 
      success: true, 
      user: {
        id: user.id,
        nome: user.nome,
        role: roles[0] || 'comprador',
        roles,
        setores: setoresArray,
        created_at: user.created_at,
      }
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { error: 'Erro ao buscar usuário' };
  }
}

export async function createUserAction(formData: FormData) {
  const rawData = {
    nome: formData.get('nome') as string,
    password: formData.get('password') as string,
    role: formData.get('role') as string,
    setores: formData.get('setores') as string || '',
  };

  const parseResult = createUserSchema.safeParse(rawData);
  if (!parseResult.success) {
    return { error: parseResult.error.issues.map(e => e.message).join(', ') };
  }

  const { nome, password, role, setores } = parseResult.data;

  // Validar e sanitizar nome
  if (!isSafeString(nome)) {
    return { error: 'Nome contém caracteres inválidos' };
  }
  const sanitizedNome = sanitizeString(nome);

  // Validate role
  if (!['admin', 'gerente', 'comprador'].includes(role)) {
    return { error: 'Cargo inválido. Use: admin, gerente ou comprador' };
  }

  try {
    const existing = await db.select().from(users).where(eq(users.nome, sanitizedNome)).limit(1);
    if (existing.length > 0) {
      return { error: 'Usuário já cadastrado' };
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.insert(users).values({ 
      nome: sanitizedNome, 
      password_hash, 
      role, 
      setores: setores || '' 
    }).returning({
      id: users.id,
      nome: users.nome,
      role: users.role,
      setores: users.setores,
      created_at: users.created_at,
    });
    
    return { success: true, user: result[0] };
  } catch (error) {
    console.error('Error creating user:', error);
    return { error: 'Erro ao criar usuário' };
  }
}

export async function listUsersAction() {
  try {
    const result = await db.select({
      id: users.id,
      nome: users.nome,
      role: users.role,
      setores: users.setores,
      created_at: users.created_at,
    }).from(users).orderBy(users.nome);
    
    return { success: true, users: result };
  } catch (error) {
    console.error('Error listing users:', error);
    return { error: 'Database unavailable' };
  }
}

export async function updateUserAction(id: number, data: Record<string, unknown>) {
  const parseResult = updateUserSchema.safeParse(data);
  if (!parseResult.success) {
    return { error: parseResult.error.issues.map(e => e.message).join(', ') };
  }

  try {
    // Check for duplicate name if name is being updated
    if (parseResult.data.nome) {
      const existing = await db.select().from(users)
        .where(eq(users.nome, parseResult.data.nome))
        .limit(1);
      
      if (existing.length > 0 && existing[0].id !== id) {
        return { error: 'Já existe um usuário com este nome' };
      }
    }

    const updateData: Record<string, unknown> = {};
    if (parseResult.data.nome !== undefined) updateData.nome = parseResult.data.nome;
    if (parseResult.data.role !== undefined) updateData.role = parseResult.data.role;
    if (parseResult.data.setores !== undefined) updateData.setores = parseResult.data.setores;

    await db.update(users).set(updateData).where(eq(users.id, id));
    
    // If the user is editing themselves, refresh the JWT
    const currentUserId = await getCurrentUserId();
    if (currentUserId === id) {
      await refreshUserToken(id);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { error: 'Erro ao atualizar usuário' };
  }
}

export async function updateCurrentUserProfileAction(data: { nome: string }) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Não autenticado' };
  
  if (!data.nome || data.nome.length < 1 || data.nome.length > 100) {
    return { error: 'Nome é obrigatório (1 a 100 caracteres)' };
  }
  
  try {
    // Check for duplicate name
    const existing = await db.select().from(users)
      .where(eq(users.nome, data.nome))
      .limit(1);
    
    if (existing.length > 0 && existing[0].id !== userId) {
      return { error: 'Já existe um usuário com este nome' };
    }
    
    await db.update(users).set({ nome: data.nome }).where(eq(users.id, userId));
    await refreshUserToken(userId);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'Erro ao atualizar perfil' };
  }
}

export async function deleteUserAction(id: number) {
  const currentUserId = await getCurrentUserId();
  
  // Cannot delete yourself
  if (currentUserId === id) {
    return { error: 'Você não pode excluir seu próprio usuário' };
  }
  
  try {
    // Check if user is linked to any sectors
    const linkedSectors = await db.select()
      .from(sectors)
      .where(eq(sectors.comprador_id, id))
      .limit(1);
    
    if (linkedSectors.length > 0) {
      return { error: 'Não é possível excluir este usuário porque ele está vinculado a um ou mais departamentos.' };
    }
    
    await db.delete(users).where(eq(users.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: 'Erro ao deletar usuário' };
  }
}

export async function updatePasswordAction(id: number, oldPassword: string, newPassword: string) {
  const parseResult = updatePasswordSchema.safeParse({ oldPassword, newPassword });
  if (!parseResult.success) {
    return { error: parseResult.error.issues.map(e => e.message).join(', ') };
  }

  try {
    const userList = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (userList.length === 0) return { error: 'Usuário não encontrado' };

    const user = userList[0];
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) return { error: 'Senha atual incorreta.' };

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password_hash: newHash }).where(eq(users.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    return { error: 'Erro ao atualizar senha' };
  }
}

export async function listCompradoresAction() {
  try {
    const result = await db.select({
      id: users.id,
      nome: users.nome,
    }).from(users).where(eq(users.role, 'comprador')).orderBy(users.nome);
    return { success: true, compradores: result };
  } catch (error) {
    console.error('Error listing compradores:', error);
    return { error: 'Database unavailable' };
  }
}
