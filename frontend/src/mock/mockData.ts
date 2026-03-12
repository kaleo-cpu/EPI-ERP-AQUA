// ============= Mock Data for ERP-EPI =============

// Categorias de EPI
export const categoriasEPI = [
  'Calçado', 'Ocular', 'Respiratória', 'Auditiva', 'Cabeça', 'Mãos', 'Corpo', 'Outros',
];

// EPIs completos
export interface EPI {
  id: number;
  nome: string;
  categoria: string;
  tempo_validade_dias: number;
  numero_ca: string;
  validade_ca: string;
  fabricante: string;
  modelo: string;
  unidade: string;
  alerta_estoque_min: number;
  observacoes: string;
}

export const epiList: EPI[] = [
  { id: 1, nome: 'Capacete MSA V-Gard', categoria: 'Cabeça', tempo_validade_dias: 365, numero_ca: '12345', validade_ca: '15/12/2027', fabricante: 'MSA', modelo: 'V-Gard', unidade: 'UN', alerta_estoque_min: 10, observacoes: '' },
  { id: 2, nome: 'Luva Nitrílica P', categoria: 'Mãos', tempo_validade_dias: 180, numero_ca: '23456', validade_ca: '20/06/2027', fabricante: 'Danny', modelo: 'Maxiflex', unidade: 'PAR', alerta_estoque_min: 50, observacoes: 'Tamanho P' },
  { id: 3, nome: 'Óculos Ampla Visão', categoria: 'Ocular', tempo_validade_dias: 365, numero_ca: '34567', validade_ca: '10/09/2027', fabricante: 'Carbografite', modelo: 'AV-300', unidade: 'UN', alerta_estoque_min: 20, observacoes: '' },
  { id: 4, nome: 'Protetor Auricular 3M', categoria: 'Auditiva', tempo_validade_dias: 365, numero_ca: '45678', validade_ca: '01/03/2028', fabricante: '3M', modelo: '1100', unidade: 'PAR', alerta_estoque_min: 30, observacoes: 'Espuma descartável' },
  { id: 5, nome: 'Bota PVC Cano Longo', categoria: 'Calçado', tempo_validade_dias: 365, numero_ca: '56789', validade_ca: '05/11/2026', fabricante: 'Fujiwara', modelo: 'Solado Borracha', unidade: 'PAR', alerta_estoque_min: 15, observacoes: '' },
  { id: 6, nome: 'Respirador PFF2', categoria: 'Respiratória', tempo_validade_dias: 90, numero_ca: '67890', validade_ca: '30/08/2027', fabricante: '3M', modelo: 'Aura 9320+', unidade: 'UN', alerta_estoque_min: 40, observacoes: 'Uso único' },
  { id: 7, nome: 'Avental de Raspa', categoria: 'Corpo', tempo_validade_dias: 365, numero_ca: '78901', validade_ca: '22/04/2028', fabricante: 'Hércules', modelo: 'Raspa Curtida', unidade: 'UN', alerta_estoque_min: 5, observacoes: '' },
  { id: 8, nome: 'Cinto Paraquedista', categoria: 'Corpo', tempo_validade_dias: 365, numero_ca: '89012', validade_ca: '18/07/2027', fabricante: 'DeltaPlus', modelo: 'HAR32', unidade: 'UN', alerta_estoque_min: 3, observacoes: 'Inspeção semestral obrigatória' },
  { id: 9, nome: 'Luva de Vaqueta', categoria: 'Mãos', tempo_validade_dias: 180, numero_ca: '90123', validade_ca: '14/01/2028', fabricante: 'Danny', modelo: 'DA-12100', unidade: 'PAR', alerta_estoque_min: 20, observacoes: '' },
  { id: 10, nome: 'Protetor Facial Incolor', categoria: 'Ocular', tempo_validade_dias: 365, numero_ca: '01234', validade_ca: '28/10/2027', fabricante: 'Carbografite', modelo: 'CG-500', unidade: 'UN', alerta_estoque_min: 10, observacoes: '' },
];

// Lotes
export interface Lote {
  id: number;
  epi_id: number;
  epi_nome: string;
  lote: string;
  nf_numero: string;
  nf_serie: string;
  fornecedor_cnpj: string;
  data_compra: string;
  quantidade: number;
  quantidade_disponivel: number;
  local_armazenamento: string;
}

export const lotes: Lote[] = [
  { id: 1, epi_id: 1, epi_nome: 'Capacete MSA V-Gard', lote: 'LT-2026-001', nf_numero: 'NF-5521', nf_serie: '1', fornecedor_cnpj: '11.222.333/0001-44', data_compra: '15/01/2026', quantidade: 50, quantidade_disponivel: 45, local_armazenamento: 'Almoxarifado A - Prateleira 1' },
  { id: 2, epi_id: 2, epi_nome: 'Luva Nitrílica P', lote: 'LT-2026-002', nf_numero: 'NF-5522', nf_serie: '1', fornecedor_cnpj: '22.333.444/0001-55', data_compra: '20/01/2026', quantidade: 500, quantidade_disponivel: 200, local_armazenamento: 'Almoxarifado A - Prateleira 3' },
  { id: 3, epi_id: 3, epi_nome: 'Óculos Ampla Visão', lote: 'LT-2026-003', nf_numero: 'NF-5530', nf_serie: '1', fornecedor_cnpj: '33.444.555/0001-66', data_compra: '01/02/2026', quantidade: 30, quantidade_disponivel: 3, local_armazenamento: 'Almoxarifado A - Prateleira 2' },
  { id: 4, epi_id: 4, epi_nome: 'Protetor Auricular 3M', lote: 'LT-2026-004', nf_numero: 'NF-5535', nf_serie: '1', fornecedor_cnpj: '44.555.666/0001-77', data_compra: '10/02/2026', quantidade: 200, quantidade_disponivel: 120, local_armazenamento: 'Almoxarifado B - Prateleira 1' },
  { id: 5, epi_id: 5, epi_nome: 'Bota PVC Cano Longo', lote: 'LT-2025-050', nf_numero: 'NF-5400', nf_serie: '1', fornecedor_cnpj: '55.666.777/0001-88', data_compra: '10/09/2025', quantidade: 20, quantidade_disponivel: 0, local_armazenamento: 'Almoxarifado B - Prateleira 4' },
  { id: 6, epi_id: 6, epi_nome: 'Respirador PFF2', lote: 'LT-2026-010', nf_numero: 'NF-5560', nf_serie: '2', fornecedor_cnpj: '44.555.666/0001-77', data_compra: '25/02/2026', quantidade: 300, quantidade_disponivel: 85, local_armazenamento: 'Almoxarifado A - Prateleira 5' },
  { id: 7, epi_id: 7, epi_nome: 'Avental de Raspa', lote: 'LT-2026-011', nf_numero: 'NF-5565', nf_serie: '1', fornecedor_cnpj: '66.777.888/0001-99', data_compra: '28/02/2026', quantidade: 15, quantidade_disponivel: 12, local_armazenamento: 'Almoxarifado B - Prateleira 2' },
  { id: 8, epi_id: 8, epi_nome: 'Cinto Paraquedista', lote: 'LT-2026-012', nf_numero: 'NF-5570', nf_serie: '1', fornecedor_cnpj: '77.888.999/0001-00', data_compra: '01/03/2026', quantidade: 10, quantidade_disponivel: 8, local_armazenamento: 'Almoxarifado C - Área Especial' },
  { id: 9, epi_id: 2, epi_nome: 'Luva Nitrílica P', lote: 'LT-2026-042', nf_numero: 'NF-5610', nf_serie: '1', fornecedor_cnpj: '22.333.444/0001-55', data_compra: '08/03/2026', quantidade: 500, quantidade_disponivel: 498, local_armazenamento: 'Almoxarifado A - Prateleira 3' },
  { id: 10, epi_id: 9, epi_nome: 'Luva de Vaqueta', lote: 'LT-2026-015', nf_numero: 'NF-5580', nf_serie: '1', fornecedor_cnpj: '22.333.444/0001-55', data_compra: '05/03/2026', quantidade: 100, quantidade_disponivel: 95, local_armazenamento: 'Almoxarifado A - Prateleira 3' },
  { id: 11, epi_id: 10, epi_nome: 'Protetor Facial Incolor', lote: 'LT-2026-016', nf_numero: 'NF-5585', nf_serie: '1', fornecedor_cnpj: '33.444.555/0001-66', data_compra: '06/03/2026', quantidade: 25, quantidade_disponivel: 22, local_armazenamento: 'Almoxarifado A - Prateleira 2' },
];

// Entregas
export interface Entrega {
  id: number;
  protocolo: string;
  funcionario_id: number;
  funcionario_nome: string;
  funcionario_setor: string;
  epi_id: number;
  epi_nome: string;
  lote_id: number;
  lote_codigo: string;
  quantidade_entregue: number;
  data_entrega: string;
  data_vencimento: string;
  observacao: string;
  responsavel_entrega: string;
  status: 'Ativo' | 'Próx. Vencimento' | 'Vencido' | 'Substituído' | 'Devolvido';
}

// Gerador de protocolo único
const protocolosGerados = new Set<string>();
export function gerarProtocolo(): string {
  let protocolo: string;
  do {
    const now = new Date();
    const ano = now.getFullYear();
    const seq = Math.floor(Math.random() * 900000) + 100000;
    protocolo = `ENT-${ano}-${seq}`;
  } while (protocolosGerados.has(protocolo));
  protocolosGerados.add(protocolo);
  return protocolo;
}

export const entregas: Entrega[] = [
  { id: 1, protocolo: 'ENT-2026-100001', funcionario_id: 1, funcionario_nome: 'Carlos Silva', funcionario_setor: 'Produção', epi_id: 1, epi_nome: 'Capacete MSA V-Gard', lote_id: 1, lote_codigo: 'LT-2026-001', quantidade_entregue: 1, data_entrega: '10/03/2026', data_vencimento: '10/03/2027', observacao: '', responsavel_entrega: 'Camila Rocha', status: 'Ativo' },
  { id: 2, protocolo: 'ENT-2026-100002', funcionario_id: 1, funcionario_nome: 'Carlos Silva', funcionario_setor: 'Produção', epi_id: 2, epi_nome: 'Luva Nitrílica P', lote_id: 2, lote_codigo: 'LT-2026-002', quantidade_entregue: 2, data_entrega: '01/02/2026', data_vencimento: '01/08/2026', observacao: '', responsavel_entrega: 'Camila Rocha', status: 'Ativo' },
  { id: 3, protocolo: 'ENT-2025-100003', funcionario_id: 1, funcionario_nome: 'Carlos Silva', funcionario_setor: 'Produção', epi_id: 5, epi_nome: 'Bota PVC Cano Longo', lote_id: 5, lote_codigo: 'LT-2025-050', quantidade_entregue: 1, data_entrega: '15/01/2025', data_vencimento: '15/01/2026', observacao: 'Necessita substituição urgente', responsavel_entrega: 'Marcos Tavares', status: 'Vencido' },
  { id: 4, protocolo: 'ENT-2026-100004', funcionario_id: 2, funcionario_nome: 'Ana Santos', funcionario_setor: 'Manutenção', epi_id: 3, epi_nome: 'Óculos Ampla Visão', lote_id: 3, lote_codigo: 'LT-2026-003', quantidade_entregue: 1, data_entrega: '05/03/2026', data_vencimento: '05/03/2027', observacao: '', responsavel_entrega: 'Camila Rocha', status: 'Ativo' },
  { id: 5, protocolo: 'ENT-2026-100005', funcionario_id: 2, funcionario_nome: 'Ana Santos', funcionario_setor: 'Manutenção', epi_id: 2, epi_nome: 'Luva Nitrílica P', lote_id: 9, lote_codigo: 'LT-2026-042', quantidade_entregue: 2, data_entrega: '10/03/2026', data_vencimento: '10/09/2026', observacao: '', responsavel_entrega: 'Camila Rocha', status: 'Ativo' },
  { id: 6, protocolo: 'ENT-2026-100006', funcionario_id: 3, funcionario_nome: 'Roberto Lima', funcionario_setor: 'Logística', epi_id: 4, epi_nome: 'Protetor Auricular 3M', lote_id: 4, lote_codigo: 'LT-2026-004', quantidade_entregue: 1, data_entrega: '20/02/2026', data_vencimento: '20/02/2027', observacao: '', responsavel_entrega: 'Camila Rocha', status: 'Ativo' },
  { id: 7, protocolo: 'ENT-2026-100007', funcionario_id: 3, funcionario_nome: 'Roberto Lima', funcionario_setor: 'Logística', epi_id: 3, epi_nome: 'Óculos Ampla Visão', lote_id: 3, lote_codigo: 'LT-2026-003', quantidade_entregue: 1, data_entrega: '09/03/2026', data_vencimento: '09/03/2027', observacao: '', responsavel_entrega: 'Marcos Tavares', status: 'Ativo' },
  { id: 8, protocolo: 'ENT-2026-100008', funcionario_id: 4, funcionario_nome: 'Maria Oliveira', funcionario_setor: 'Produção', epi_id: 4, epi_nome: 'Protetor Auricular 3M', lote_id: 4, lote_codigo: 'LT-2026-004', quantidade_entregue: 1, data_entrega: '08/03/2026', data_vencimento: '08/03/2027', observacao: '', responsavel_entrega: 'Camila Rocha', status: 'Ativo' },
  { id: 9, protocolo: 'ENT-2026-100009', funcionario_id: 5, funcionario_nome: 'João Costa', funcionario_setor: 'Qualidade', epi_id: 6, epi_nome: 'Respirador PFF2', lote_id: 6, lote_codigo: 'LT-2026-010', quantidade_entregue: 1, data_entrega: '01/01/2026', data_vencimento: '01/04/2026', observacao: '', responsavel_entrega: 'Marcos Tavares', status: 'Próx. Vencimento' },
  { id: 10, protocolo: 'ENT-2025-100010', funcionario_id: 5, funcionario_nome: 'João Costa', funcionario_setor: 'Qualidade', epi_id: 3, epi_nome: 'Óculos Ampla Visão', lote_id: 3, lote_codigo: 'LT-2026-003', quantidade_entregue: 1, data_entrega: '10/12/2025', data_vencimento: '10/12/2026', observacao: '', responsavel_entrega: 'Camila Rocha', status: 'Ativo' },
  { id: 11, protocolo: 'ENT-2026-100011', funcionario_id: 5, funcionario_nome: 'João Costa', funcionario_setor: 'Qualidade', epi_id: 5, epi_nome: 'Bota PVC Cano Longo', lote_id: 5, lote_codigo: 'LT-2025-050', quantidade_entregue: 1, data_entrega: '08/03/2026', data_vencimento: '08/03/2026', observacao: 'Devolvido em bom estado', responsavel_entrega: 'Camila Rocha', status: 'Devolvido' },
  { id: 12, protocolo: 'ENT-2026-100012', funcionario_id: 7, funcionario_nome: 'Pedro Alves', funcionario_setor: 'Manutenção', epi_id: 8, epi_nome: 'Cinto Paraquedista', lote_id: 8, lote_codigo: 'LT-2026-012', quantidade_entregue: 1, data_entrega: '02/03/2026', data_vencimento: '02/03/2027', observacao: '', responsavel_entrega: 'Marcos Tavares', status: 'Ativo' },
  { id: 13, protocolo: 'ENT-2026-100013', funcionario_id: 9, funcionario_nome: 'Ricardo Nunes', funcionario_setor: 'Produção', epi_id: 1, epi_nome: 'Capacete MSA V-Gard', lote_id: 1, lote_codigo: 'LT-2026-001', quantidade_entregue: 1, data_entrega: '05/03/2026', data_vencimento: '05/03/2027', observacao: '', responsavel_entrega: 'Camila Rocha', status: 'Ativo' },
  { id: 14, protocolo: 'ENT-2026-100014', funcionario_id: 9, funcionario_nome: 'Ricardo Nunes', funcionario_setor: 'Produção', epi_id: 9, epi_nome: 'Luva de Vaqueta', lote_id: 10, lote_codigo: 'LT-2026-015', quantidade_entregue: 1, data_entrega: '06/03/2026', data_vencimento: '03/09/2026', observacao: '', responsavel_entrega: 'Camila Rocha', status: 'Ativo' },
  { id: 15, protocolo: 'ENT-2025-100015', funcionario_id: 6, funcionario_nome: 'Fernanda Dias', funcionario_setor: 'Logística', epi_id: 1, epi_nome: 'Capacete MSA V-Gard', lote_id: 1, lote_codigo: 'LT-2026-001', quantidade_entregue: 1, data_entrega: '01/01/2025', data_vencimento: '01/01/2026', observacao: 'Substituído por novo capacete', responsavel_entrega: 'Marcos Tavares', status: 'Substituído' },
];

// Registrar protocolos existentes no Set
entregas.forEach(e => protocolosGerados.add(e.protocolo));

// Dashboard Stats
export const dashboardStats = [
  { title: 'EPIs Cadastrados', value: epiList.length, icon: 'Shield', color: '#0B5ED7', trend: '+12%' },
  { title: 'Lotes Ativos', value: lotes.filter(l => l.quantidade_disponivel > 0).length, icon: 'Inventory', color: '#2E7D32', trend: '+4' },
  { title: 'Estoque Baixo', value: 3, icon: 'Warning', color: '#E53935', trend: '-2' },
  { title: 'Próx. Validade', value: entregas.filter(e => e.status === 'Próx. Vencimento').length, icon: 'Schedule', color: '#F57F17', trend: '+3' },
  { title: 'Entregas Recentes', value: entregas.length, icon: 'LocalShipping', color: '#FFC400', trend: '+18' },
  { title: 'EPIs Vencidos', value: entregas.filter(e => e.status === 'Vencido').length, icon: 'PersonAlert', color: '#C62828', trend: '+1' },
];

export const entregasPorMes = [
  { mes: 'Out', entregas: 42 },
  { mes: 'Nov', entregas: 58 },
  { mes: 'Dez', entregas: 35 },
  { mes: 'Jan', entregas: 67 },
  { mes: 'Fev', entregas: 52 },
  { mes: 'Mar', entregas: 56 },
];

export const alertas = [
  { id: 1, tipo: 'critico', titulo: 'Bota PVC Cano Longo sem estoque', descricao: 'Estoque zerado. Necessário reposição urgente.', data: '10/03/2026' },
  { id: 2, tipo: 'critico', titulo: '1 funcionário com EPI vencido', descricao: 'Carlos Silva possui Bota PVC com validade expirada.', data: '10/03/2026' },
  { id: 3, tipo: 'alerta', titulo: 'Óculos Ampla Visão com estoque baixo', descricao: 'Apenas 3 unidades restantes. Mínimo: 20.', data: '09/03/2026' },
  { id: 4, tipo: 'alerta', titulo: 'Respirador PFF2 próximo do vencimento', descricao: 'João Costa: vencimento em 01/04/2026.', data: '09/03/2026' },
  { id: 5, tipo: 'info', titulo: 'Novo lote de luvas registrado', descricao: 'LT-2026-042 com 500 un. de Luva Nitrílica P.', data: '08/03/2026' },
];

export const movimentacoesRecentes = entregas.slice(0, 6).map(e => ({
  id: e.id,
  tipo: e.status === 'Devolvido' ? 'Devolução' : 'Entrega',
  funcionario: e.funcionario_nome,
  epi: e.epi_nome,
  quantidade: e.quantidade_entregue,
  data: e.data_entrega,
  status: 'Concluído',
}));

export const recentDeliveries = movimentacoesRecentes;

// Funcionários
export const funcionarios = [
  { id: 1, nome: 'Carlos Silva', matricula: 'F001', cpf: '123.456.789-01', setor: 'Produção', funcao: 'Operador de Máquinas', data_admissao: '15/03/2019', status: 'Ativo', observacoes: '' },
  { id: 2, nome: 'Ana Santos', matricula: 'F002', cpf: '234.567.890-12', setor: 'Manutenção', funcao: 'Técnica em Manutenção', data_admissao: '02/08/2020', status: 'Ativo', observacoes: 'Certificação NR-10' },
  { id: 3, nome: 'Roberto Lima', matricula: 'F003', cpf: '345.678.901-23', setor: 'Logística', funcao: 'Auxiliar de Logística', data_admissao: '10/01/2021', status: 'Ativo', observacoes: '' },
  { id: 4, nome: 'Maria Oliveira', matricula: 'F004', cpf: '456.789.012-34', setor: 'Produção', funcao: 'Supervisora de Produção', data_admissao: '05/06/2017', status: 'Férias', observacoes: 'Retorno previsto 25/03/2026' },
  { id: 5, nome: 'João Costa', matricula: 'F005', cpf: '567.890.123-45', setor: 'Qualidade', funcao: 'Inspetor de Qualidade', data_admissao: '20/11/2018', status: 'Ativo', observacoes: '' },
  { id: 6, nome: 'Fernanda Dias', matricula: 'F006', cpf: '678.901.234-56', setor: 'Logística', funcao: 'Coordenadora de Logística', data_admissao: '12/04/2016', status: 'Ativo', observacoes: '' },
  { id: 7, nome: 'Pedro Alves', matricula: 'F007', cpf: '789.012.345-67', setor: 'Manutenção', funcao: 'Encarregado de Manutenção', data_admissao: '08/09/2015', status: 'Ativo', observacoes: 'Responsável técnico NR-12' },
  { id: 8, nome: 'Lucia Mendes', matricula: 'F008', cpf: '890.123.456-78', setor: 'Administrativo', funcao: 'Gerente Administrativa', data_admissao: '01/02/2014', status: 'Ativo', observacoes: '' },
  { id: 9, nome: 'Ricardo Nunes', matricula: 'F009', cpf: '901.234.567-89', setor: 'Produção', funcao: 'Operador de Empilhadeira', data_admissao: '14/07/2022', status: 'Ativo', observacoes: 'CNH categoria D' },
  { id: 10, nome: 'Patrícia Ferreira', matricula: 'F010', cpf: '012.345.678-90', setor: 'Qualidade', funcao: 'Analista de Qualidade', data_admissao: '28/03/2023', status: 'Inativo', observacoes: 'Desligada em 01/02/2026' },
];

export const episPorFuncionario: Record<number, Array<{ epi: string; ca: string; dataEntrega: string; validade: string; status: string }>> = {
  1: [
    { epi: 'Capacete MSA V-Gard', ca: '12345', dataEntrega: '10/03/2026', validade: '10/03/2027', status: 'Válido' },
    { epi: 'Luva Nitrílica P', ca: '23456', dataEntrega: '01/02/2026', validade: '01/08/2026', status: 'Válido' },
    { epi: 'Bota PVC Cano Longo', ca: '56789', dataEntrega: '15/01/2025', validade: '15/01/2026', status: 'Vencido' },
  ],
  2: [
    { epi: 'Óculos Ampla Visão', ca: '34567', dataEntrega: '05/03/2026', validade: '05/03/2027', status: 'Válido' },
    { epi: 'Luva Nitrílica P', ca: '23456', dataEntrega: '10/03/2026', validade: '10/09/2026', status: 'Válido' },
  ],
  5: [
    { epi: 'Respirador PFF2', ca: '67890', dataEntrega: '01/01/2026', validade: '01/04/2026', status: 'Próx. Vencimento' },
    { epi: 'Óculos Ampla Visão', ca: '34567', dataEntrega: '10/12/2025', validade: '10/12/2026', status: 'Válido' },
  ],
};

export const usuarios = [
  { id: 1, nome: 'Admin Sistema', email: 'admin@erp-epi.com', perfil: 'Administrador', setor: 'Todos', status: 'Ativo', cor: '#0B5ED7' },
  { id: 2, nome: 'Marcos Tavares', email: 'marcos.tavares@erp-epi.com', perfil: 'Segurança do Trabalho', setor: 'Segurança', status: 'Ativo', cor: '#2E7D32' },
  { id: 3, nome: 'Camila Rocha', email: 'camila.rocha@erp-epi.com', perfil: 'Almoxarifado', setor: 'Logística', status: 'Ativo', cor: '#F57F17' },
  { id: 4, nome: 'Guilherme Pinto', email: 'guilherme.pinto@erp-epi.com', perfil: 'Gestor', setor: 'Produção', status: 'Ativo', cor: '#071A2B' },
  { id: 5, nome: 'Juliana Martins', email: 'juliana.martins@erp-epi.com', perfil: 'Consulta', setor: 'Qualidade', status: 'Inativo', cor: '#9E9E9E' },
  { id: 6, nome: 'Renato Souza', email: 'renato.souza@erp-epi.com', perfil: 'Almoxarifado', setor: 'Logística', status: 'Ativo', cor: '#E53935' },
];

export const setores = [
  { id: 1, nome: 'Produção', descricao: 'Linha de produção industrial e montagem', responsavel: 'Maria Oliveira', status: 'Ativo', funcionarios: 42 },
  { id: 2, nome: 'Manutenção', descricao: 'Manutenção preventiva e corretiva de equipamentos', responsavel: 'Pedro Alves', status: 'Ativo', funcionarios: 18 },
  { id: 3, nome: 'Logística', descricao: 'Recebimento, armazenagem e expedição', responsavel: 'Fernanda Dias', status: 'Ativo', funcionarios: 24 },
  { id: 4, nome: 'Qualidade', descricao: 'Controle e garantia de qualidade dos processos', responsavel: 'João Costa', status: 'Ativo', funcionarios: 12 },
  { id: 5, nome: 'Administrativo', descricao: 'Gestão administrativa e financeira', responsavel: 'Lucia Mendes', status: 'Ativo', funcionarios: 15 },
  { id: 6, nome: 'Segurança do Trabalho', descricao: 'Prevenção de acidentes e saúde ocupacional', responsavel: 'Marcos Tavares', status: 'Ativo', funcionarios: 6 },
  { id: 7, nome: 'Almoxarifado', descricao: 'Controle de materiais e EPIs', responsavel: 'Camila Rocha', status: 'Ativo', funcionarios: 8 },
];

export const lowStockAlerts = [
  { epi: 'Óculos Ampla Visão', estoque: 3, minimo: 20 },
  { epi: 'Bota PVC Cano Longo', estoque: 0, minimo: 15 },
  { epi: 'Cinto Paraquedista', estoque: 8, minimo: 10 },
];

export const perfisUsuario = [
  'Administrador', 'Almoxarifado', 'Segurança do Trabalho', 'Gestor', 'Consulta',
];
