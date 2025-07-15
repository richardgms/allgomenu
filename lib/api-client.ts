// Utilitário para fazer requisições autenticadas
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('supabase_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// Função para verificar se o usuário está autenticado
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('supabase_token');
  return !!token;
}

// Função para logout
export function logout(): void {
  localStorage.removeItem('supabase_token');
  window.location.href = '/admin/login';
}

// Função para lidar com erros de autenticação
export function handleAuthError(response: Response): void {
  if (response.status === 401) {
    logout();
  }
} 