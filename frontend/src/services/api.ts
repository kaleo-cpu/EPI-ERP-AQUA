const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api';

const ACCESS_KEY = 'erp-epi-access';
const REFRESH_KEY = 'erp-epi-refresh';

function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem('erp-epi-user');
  localStorage.removeItem('erp-epi-auth');
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearSession();
    return null;
  }

  const data = await response.json();
  if (data?.access) {
    localStorage.setItem(ACCESS_KEY, data.access);
    return data.access;
  }

  clearSession();
  return null;
}

type RequestOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
};

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, retry = true, headers, body, ...rest } = options;

  const finalHeaders = new Headers(headers || {});

  if (!(body instanceof FormData)) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const access = getAccessToken();
    if (access) {
      finalHeaders.set('Authorization', `Bearer ${access}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: finalHeaders,
    body,
  });

  if (response.status === 401 && auth && retry) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      return request<T>(endpoint, { ...options, retry: false });
    }
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let message = 'Erro na requisição.';
    if (typeof data === 'string' && data) {
      message = data;
    } else if ((data as any)?.detail) {
      message = (data as any).detail;
    } else if (typeof data === 'object' && data) {
      const firstKey = Object.keys(data)[0];
      const firstValue = (data as any)[firstKey];
      if (Array.isArray(firstValue) && firstValue.length > 0) {
        message = String(firstValue[0]);
      } else if (firstValue) {
        message = String(firstValue);
      }
    }
    throw new Error(message);
  }

  return data as T;
}

async function requestBlob(endpoint: string): Promise<Blob> {
  const access = getAccessToken();
  const headers = new Headers();

  if (access) {
    headers.set('Authorization', `Bearer ${access}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (response.status === 401) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      return requestBlob(endpoint);
    }
  }

  if (!response.ok) {
    throw new Error('Não foi possível exportar o relatório.');
  }

  return response.blob();
}

// =====================
// Tipos
// =====================

export type CategoriaEPIValue =
  | 'calçado'
  | 'ocular'
  | 'respiratória'
  | 'auditiva'
  | 'cabeça'
  | 'mãos'
  | 'corpo'
  | 'outros';

export type EPI = {
  id: number;
  nome: string;
  categoria: CategoriaEPIValue;
  tempo_validade_dias: number;
  numero_ca: string;
  validade_ca: string | null;
  fabricante: string;
  modelo: string;
  unidade: string;
  alerta_estoque_min: number;
  observacoes: string;
};

export type EPIInput = Omit<EPI, 'id'>;

export type Lote = {
  id: number;
  epi: number;
  lote: string;
  nf_numero: string;
  nf_serie: string;
  fornecedor_cnpj: string;
  data_compra: string;
  quantidade: number;
  local_armazenamento: string;
  disponivel: number;
};

export type LoteInput = Omit<Lote, 'id' | 'disponivel'>;

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil: 'admin' | 'gestor' | 'colaborador' | string;
  username?: string;
};

export type UsuarioInput = {
  nome: string;
  email: string;
  perfil: 'admin' | 'gestor' | 'colaborador' | string;
  senha?: string;
};

export type Funcionario = {
  id: number;
  nome: string;
  cpf: string;
  data_nascimento?: string | null;
  nome_pai?: string;
  nome_mae?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  cbo: string;
  funcao: string;
  setor: string;
  data_admissao: string;
  pis?: string;
  ctps_numero?: string;
  ctps_serie?: string;
  status: 'ativo' | 'inativo';
  biometria_template_hash?: string;
};

export type FuncionarioInput = Omit<Funcionario, 'id'>;

export type Entrega = {
  id: number;
  funcionario: number;
  funcionario_nome?: string;
  setor?: string;
  epi: number;
  epi_nome?: string;
  lote: string;
  quantidade: number;
  verif_facial_score?: number | null;
  data_entrega: string;
  data_validade_prevista: string;
  protocolo?: string | null;
};

export type EntregaInput = {
  epi_id: number;
  funcionario_id: number;
  quantidade: number;
  lote_id: number;
  verif_facial_score?: number;
};

export type EntregaRelatorio = {
  id: number;
  funcionario_nome: string;
  setor: string;
  epi_nome: string;
  categoria: string;
  numero_ca: string;
  lote: string;
  quantidade: number;
  data_entrega: string;
  validade_ate: string | null;
  protocolo?: string | null;
};

export type DashboardKpis = {
  consumo_por_setor: Array<{ funcionario__setor: string; total: number }>;
  top_consumidores: Array<{ funcionario__nome: string; total: number }>;
  proximos_vencimentos: Array<{
    funcionario__nome: string;
    epi__nome: string;
    data_validade_prevista: string;
  }>;
};

export type MonitorValidadeItem = {
  funcionario__nome: string;
  funcionario__setor: string;
  epi__nome: string;
  data_validade_prevista: string;
};

export const categoriasEPI: Array<{ value: CategoriaEPIValue; label: string }> = [
  { value: 'calçado', label: 'Calçado' },
  { value: 'ocular', label: 'Proteção Ocular' },
  { value: 'respiratória', label: 'Proteção Respiratória' },
  { value: 'auditiva', label: 'Proteção Auditiva' },
  { value: 'cabeça', label: 'Cabeça' },
  { value: 'mãos', label: 'Mãos' },
  { value: 'corpo', label: 'Corpo' },
  { value: 'outros', label: 'Outros' },
];

// =====================
// EPIs
// =====================

export const listarEPIs = () => request<EPI[]>('/epis/');

export const criarEPI = (payload: EPIInput) =>
  request<EPI>('/epis/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const editarEPI = (id: number, payload: Partial<EPIInput>) =>
  request<EPI>(`/epis/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const excluirEPI = (id: number) =>
  request(`/epis/${id}/`, {
    method: 'DELETE',
  });

export const listarLotesPorEPI = (epiId: number) =>
  request<Array<Pick<Lote, 'id' | 'lote' | 'quantidade' | 'nf_numero' | 'data_compra'>>>(
    `/epis/${epiId}/lotes/`
  );

// =====================
// Estoque / Lotes
// =====================

export const listarLotes = async (epiId?: number) => {
  const lotes = await request<Lote[]>('/estoques/');
  return epiId ? lotes.filter((item) => Number(item.epi) === Number(epiId)) : lotes;
};

export const criarLote = (payload: LoteInput) =>
  request<Lote>('/estoques/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const editarLote = (id: number, payload: Partial<LoteInput>) =>
  request<Lote>(`/estoques/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const excluirLote = (id: number) =>
  request(`/estoques/${id}/`, {
    method: 'DELETE',
  });

export const listarAlertasEstoqueMinimo = () =>
  request<Array<{ epi_id: number; epi__nome: string; epi__alerta_estoque_min: number; saldo: number }>>(
    '/estoques/alertas-minimo/'
  );

// =====================
// Funcionários
// =====================

export const listarFuncionarios = () => request<Funcionario[]>('/funcionarios/');

export const criarFuncionario = (payload: FuncionarioInput) =>
  request<Funcionario>('/funcionarios/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const editarFuncionario = (id: number, payload: Partial<FuncionarioInput>) =>
  request<Funcionario>(`/funcionarios/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const excluirFuncionarioComSenha = (id: number, senha: string) =>
  request<{ detail?: string }>(`/funcionarios/${id}/excluir_com_senha/`, {
    method: 'POST',
    body: JSON.stringify({ senha }),
  });

// =====================
// Usuários
// =====================

export const listarUsuarios = () => request<Usuario[]>('/usuarios/');

export const criarUsuario = (payload: UsuarioInput) =>
  request<Usuario>('/usuarios/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const editarUsuario = (id: number, payload: Partial<UsuarioInput>) =>
  request<Usuario>(`/usuarios/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

// =====================
// Entregas
// =====================

export const listarEntregas = () => request<Entrega[]>('/entregas/');

export const registrarEntrega = (payload: EntregaInput) =>
  request<Entrega>('/entregas/entregar/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const listarEntregasRelatorio = async (params?: {
  setor?: string;
  categoria?: string;
  numero_ca?: string;
  data_de?: string;
  data_ate?: string;
  funcionario_id?: number;
  epi_id?: number;
}) => {
  const search = new URLSearchParams();

  if (params?.setor) search.set('setor', params.setor);
  if (params?.categoria) search.set('categoria', params.categoria);
  if (params?.numero_ca) search.set('numero_ca', params.numero_ca);
  if (params?.data_de) search.set('data_de', params.data_de);
  if (params?.data_ate) search.set('data_ate', params.data_ate);
  if (params?.funcionario_id) search.set('funcionario_id', String(params.funcionario_id));
  if (params?.epi_id) search.set('epi_id', String(params.epi_id));

  const query = search.toString();
  const resp = await request<any>(`/entregas/relatorio/${query ? `?${query}` : ''}`);

  if (Array.isArray(resp)) return resp as EntregaRelatorio[];
  if (Array.isArray(resp?.results)) return resp.results as EntregaRelatorio[];
  return [];
};

export const exportarEntregasRelatorio = async (params?: {
  setor?: string;
  categoria?: string;
  data_de?: string;
  numero_ca?: string;
  data_ate?: string;
  funcionario_id?: number;
  epi_id?: number;
}) => {
  const search = new URLSearchParams();

  if (params?.setor) search.set('setor', params.setor);
  if (params?.categoria) search.set('categoria', params.categoria);
  if (params?.numero_ca) search.set('numero_ca', params.numero_ca);
  if (params?.data_de) search.set('data_de', params.data_de);
  if (params?.data_ate) search.set('data_ate', params.data_ate);
  if (params?.funcionario_id) search.set('funcionario_id', String(params.funcionario_id));
  if (params?.epi_id) search.set('epi_id', String(params.epi_id));

  const query = search.toString();
  return requestBlob(`/entregas/exportar/${query ? `?${query}` : ''}`);
};

// =====================
// Dashboard
// =====================

export const listarDashboardKPIs = () => request<DashboardKpis>('/dashboard/kpis/');

export const listarMonitorValidade = (dias = 30) =>
  request<MonitorValidadeItem[]>(`/monitor/validade/?dias=${dias}`);

export { API_BASE_URL };
