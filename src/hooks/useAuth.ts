'use client';

import { useState, useEffect } from 'react';
import { jwtVerify } from 'jose';

interface UserPayload {
  sub: string;
  nome: string;
  roles: string[];
  setores: number[];
}

interface UseAuthReturn {
  user: UserPayload | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const parseToken = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];

        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

      // Enviar requisição com credentials (envia cookie automaticamente)
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        credentials: 'include', // Importante: envia cookies
      });

        if (!response.ok) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setUser(data.payload);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    parseToken();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
  };
}