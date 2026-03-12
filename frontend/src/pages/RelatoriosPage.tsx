import { useEffect, useMemo, useState } from 'react';
import { useNotificacao } from '../components/NotificacaoProvider';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Assessment,
  Business,
  CalendarMonth,
  Download,
  Inventory2,
  LocalShipping,
  People,
  PictureAsPdf,
  Schedule,
  Warning,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import * as api from '../services/api';
import type { EntregaRelatorio, EPI, Funcionario, Lote } from '../services/api';

type ReportType =
  | 'entregas_periodo'
  | 'entregas_funcionario'
  | 'entregas_setor'
  | 'epis_vencidos'
  | 'epis_proximos'
  | 'estoque_baixo'
  | 'lotes_epi';

const reportOptions: { key: ReportType; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'entregas_periodo', label: 'Entregas por Período', icon: <CalendarMonth />, color: '#0B5ED7' },
  { key: 'entregas_funcionario', label: 'Entregas por Funcionário', icon: <People />, color: '#2E7D32' },
  { key: 'entregas_setor', label: 'Entregas por Setor', icon: <Business />, color: '#6A1B9A' },
  { key: 'epis_vencidos', label: 'EPIs Vencidos', icon: <Warning />, color: '#C62828' },
  { key: 'epis_proximos', label: 'Próximos do Vencimento', icon: <Schedule />, color: '#F57F17' },
  { key: 'estoque_baixo', label: 'Estoque Baixo', icon: <Inventory2 />, color: '#E53935' },
  { key: 'lotes_epi', label: 'Lotes por EPI', icon: <LocalShipping />, color: '#00838F' },
];

const PIE_COLORS = ['#0B5ED7', '#2E7D32', '#F57F17', '#C62828', '#6A1B9A', '#00838F', '#E65100'];

const EMPRESA = {
  nomeFantasia: 'Aqua Slides',
  razao: 'Aqua Slides Equipamentos Aquáticos LTDA.',
  cnpj: '46.186.936/0001-50',
  endereco: 'Rua Norberto da Maia, 565 - Volta Redonda - Araquari - SC',
  cep: '89245-000',
  email: 'Contato@aquaslides.com.br',
  telefone: '(47) 99753-9235',
  site: 'www.aquaslides.com.br',
};

const TERMO_JURIDICO = `Pelo presente declaro ter recebido os EPI's abaixo relacionados, comprometendo-me a utilizá-los de acordo com a finalidade a que se destinam, responsabilizando-me pela sua guarda e conservação, comunicando a empresa qualquer alteração que se torne imprópria o seu uso. Declaro ainda ter sido treinado quanto ao uso correto dos EPI's abaixo, bem como, cientificado da obrigatoriedade do uso dos mesmos, comprometendo-me ainda a devolvê-los quando danificados ou ao término do contrato de trabalho. Em cumprimento ao disposto nas letras "A" e "B" do item 1.8 e item 1.8.1 da NR 01 e item 6.7 e 6.7.1 letras "A", "B" e "C" da NR 06 da Portaria 3214 de 08/06/78 da MTE bem como disposto na CLT Arts 157,158 e 166,167. Declaro ainda que concordo expressamente com minha responsabilidade de única e pessoal em sua(s) conservação(s) mantendo-o(s) em perfeito estado de uso. Fui comunicado ainda sobre minha obrigação na respectiva reposição dos EPI's quando ocorrer a perca ou danificação do mesmo.`;

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  if (value.includes('T')) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  }
  const [y, m, d] = value.split('-');
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
};

const protocoloRelatorio = (item: EntregaRelatorio, index: number) => {
  if (item.protocolo) return item.protocolo;

  const funcionario = funcionarios.find((f) => f.nome === item.funcionario_nome);

  return gerarProtocoloEntrega({
    dataEntrega: item.data_entrega,
    funcionarioId: funcionario?.id || 0,
    ordemEntrega: index + 1,
  });
};

const getEntregaStatus = (validade?: string | null) => {
  if (!validade) return { label: 'Ativo', status: 'success' as const };

  const hoje = new Date();
  const venc = new Date(validade);

  if (Number.isNaN(venc.getTime())) return { label: 'Ativo', status: 'success' as const };

  const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { label: 'Vencido', status: 'error' as const };
  if (diff <= 30) return { label: 'Próx. Vencimento', status: 'warning' as const };
  return { label: 'Ativo', status: 'success' as const };
};

const escapeHtml = (value: string) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

const buildExcelXml = (rows: EntregaRelatorio[]) => {
  const header = [
    'Protocolo',
    'Funcionário',
    'Setor',
    'EPI',
    'Categoria',
    'Lote',
    'Quantidade',
    'Data Entrega',
    'Vencimento',
  ];

  const xmlRows = [
    `<Row>${header.map((h) => `<Cell><Data ss:Type="String">${escapeHtml(h)}</Data></Cell>`).join('')}</Row>`,
    ...rows.map(
      (r) => `
        <Row>
          <Cell><Data ss:Type="String">${escapeHtml(r.protocolo || '')}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeHtml(r.funcionario_nome || '')}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeHtml(r.setor || '')}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeHtml(r.epi_nome || '')}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeHtml(r.categoria || '')}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeHtml(r.lote || '')}</Data></Cell>
          <Cell><Data ss:Type="Number">${Number(r.quantidade || 0)}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeHtml(formatDate(r.data_entrega))}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeHtml(formatDate(r.validade_ate || ''))}</Data></Cell>
        </Row>
      `
    ),
  ].join('');

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Relatorio EPI">
    <Table>
      ${xmlRows}
    </Table>
  </Worksheet>
</Workbook>`;
};

const buildPdfHtml = (
  funcionario: string,
  registros: EntregaRelatorio[],
  funcionarioDados?: Funcionario | null
) => {
  const funcionarioRegistros = registros.filter((r) => r.funcionario_nome === funcionario);
  const first = funcionarioRegistros[0];

  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Relatório EPI - ${escapeHtml(funcionario)}</title>
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        color: #222;
        margin: 26px;
        font-size: 12px;
      }
      .top-brand {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 16px;
        align-items: center;
        border-bottom: 2px solid #0B5ED7;
        padding-bottom: 12px;
        margin-bottom: 14px;
      }
      .logo-box {
        width: 120px;
        height: 72px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .logo-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      .brand-title {
        margin: 0;
        font-size: 24px;
        color: #0B5ED7;
      }
      .brand-subtitle {
        margin-top: 4px;
        font-size: 12px;
        color: #4b5563;
      }
      .header {
        border: 1px solid #d7dce3;
        padding: 14px;
        margin-bottom: 16px;
      }
      .header h1 {
        margin: 0 0 10px 0;
        font-size: 18px;
      }
      .meta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 18px;
      }
      .meta-item {
        padding: 4px 0;
      }
      .bloco {
        margin-top: 18px;
      }
      .texto {
        border: 1px solid #d7dce3;
        background: #f8fafc;
        padding: 12px;
        line-height: 1.55;
        text-align: justify;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      th, td {
        border: 1px solid #cfd6de;
        padding: 7px;
        text-align: left;
        font-size: 11px;
      }
      th {
        background: #eef3f8;
      }
      .assinaturas {
        margin-top: 44px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
      }
      .assinatura {
        text-align: center;
      }
      .linha {
        border-top: 1px solid #000;
        margin-top: 45px;
        padding-top: 6px;
      }
      .footer {
        margin-top: 50px;
        border-top: 1px solid #d7dce3;
        padding-top: 10px;
        font-size: 11px;
        line-height: 1.5;
      }
      @media print {
        body { margin: 18px; }
      }
    </style>
  </head>
  <body>
    <div class="top-brand">
      <div class="logo-box">
        <img src="${window.location.origin}/logo.png" alt="Logo Aqua Slides" class="logo-img" />
      </div>
      <div style="display: grid; justify-items: center; text-align: center;">
        <h1 class="brand-title">${escapeHtml(EMPRESA.nomeFantasia)}</h1>
      </div>
    </div>

    <div class="header">
      <h1>Relatório de Entrega de EPI</h1>
      <div class="meta">
        <div class="meta-item"><strong>Funcionário:</strong> ${escapeHtml(funcionario)}</div>
        <div class="meta-item"><strong>Setor:</strong> ${escapeHtml(first?.setor || funcionarioDados?.setor || '—')}</div>
        <div class="meta-item"><strong>Função:</strong> ${escapeHtml(funcionarioDados?.funcao || '—')}</div>
        <div class="meta-item"><strong>CBO:</strong> ${escapeHtml(funcionarioDados?.cbo || '—')}</div>
        <div class="meta-item"><strong>Data de Nascimento:</strong> ${escapeHtml(formatDate(funcionarioDados?.data_nascimento || ''))}</div>
        <div class="meta-item"><strong>Data de Admissão:</strong> ${escapeHtml(formatDate(funcionarioDados?.data_admissao || ''))}</div>
        <div class="meta-item"><strong>Nome da Mãe:</strong> ${escapeHtml(funcionarioDados?.nome_mae || '—')}</div>
        <div class="meta-item"><strong>Data de Emissão:</strong> ${escapeHtml(new Date().toLocaleDateString('pt-BR'))}</div>
      </div>
    </div>

    <div class="bloco">
      <div class="texto">${escapeHtml(TERMO_JURIDICO)}</div>
    </div>

    <div class="bloco">
      <table>
        <thead>
          <tr>
            <th>Protocolo</th>
            <th>EPI</th>
            <th>Categoria</th>
            <th>Lote</th>
            <th>Qtd.</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${funcionarioRegistros
            .map(
              (r) => `
                <tr>
                  <td>${escapeHtml(r.protocolo || '')}</td>
                  <td>${escapeHtml(r.epi_nome || '')}</td>
                  <td>${escapeHtml(r.categoria || '')}</td>
                  <td>${escapeHtml(r.lote || '—')}</td>
                  <td>${escapeHtml(String(r.quantidade || 0))}</td>
                  <td>${escapeHtml(formatDate(r.data_entrega))}</td>
                 
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="assinaturas">
      <div class="assinatura">
        <div class="linha">Assinatura do Funcionário</div>
      </div>
      <div class="assinatura">
        <div class="linha">Responsável pela Empresa</div>
      </div>
    </div>

    <div class="footer">
      <div><strong>Razão Social:</strong> ${escapeHtml(EMPRESA.razao)}<strong> CNPJ:</strong> ${escapeHtml(EMPRESA.cnpj)}</div>
      <div><strong>Endereço:</strong> ${escapeHtml(EMPRESA.endereco)}<strong> CEP:</strong> ${escapeHtml(EMPRESA.cep)}</div>
      <div><strong>Email:</strong> ${escapeHtml(EMPRESA.email)}<strong> Telefone:</strong> ${escapeHtml(EMPRESA.telefone)}</div>
      <div><strong>Site:</strong> ${escapeHtml(EMPRESA.site)}</div>
    </div>

    <script>
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 300);
      };
    </script>
  </body>
  </html>
  `;
};

const RelatoriosPage = () => {
  const { sucesso, erro } = useNotificacao();

  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType>('entregas_periodo');

  const [filterSetor, setFilterSetor] = useState('');
  const [filterEpi, setFilterEpi] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterFuncionario, setFilterFuncionario] = useState('');
  const [dataDe, setDataDe] = useState('');
  const [dataAte, setDataAte] = useState('');

  const [relatorio, setRelatorio] = useState<EntregaRelatorio[]>([]);
  const [epis, setEpis] = useState<EPI[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [relatorioResp, episResp, lotesResp, funcionariosResp] = await Promise.all([
        api.listarEntregasRelatorio(),
        api.listarEPIs(),
        api.listarLotes(),
        api.listarFuncionarios(),
      ]);

      setRelatorio(relatorioResp ?? []);
      setEpis(episResp ?? []);
      setLotes(lotesResp ?? []);
      setFuncionarios(funcionariosResp ?? []);
    } catch (e: any) {
      erro(e?.message || 'Falha ao carregar relatórios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const setores = useMemo(() => {
    return [...new Set(funcionarios.map((f) => f.setor).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [funcionarios]);

  const relatorioFiltrado = useMemo(() => {
    return relatorio.filter((item) => {
      if (filterSetor && item.setor !== filterSetor) return false;
      if (filterCategoria && item.categoria !== filterCategoria) return false;
      if (filterFuncionario && item.funcionario_nome !== filterFuncionario) return false;
      if (filterEpi && String(item.epi_nome) !== String(filterEpi)) return false;

      if (dataDe) {
        const itemDate = new Date(item.data_entrega);
        const de = new Date(`${dataDe}T00:00:00`);
        if (itemDate < de) return false;
      }

      if (dataAte) {
        const itemDate = new Date(item.data_entrega);
        const ate = new Date(`${dataAte}T23:59:59`);
        if (itemDate > ate) return false;
      }

      return true;
    });
  }, [relatorio, filterSetor, filterCategoria, filterFuncionario, filterEpi, dataDe, dataAte]);

  const entregasPorFunc = useMemo(() => {
    const map = new Map<string, number>();
    relatorioFiltrado.forEach((item) => {
      map.set(item.funcionario_nome, (map.get(item.funcionario_nome) || 0) + 1);
    });

    return [...map.entries()]
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [relatorioFiltrado]);

  const entregasPorSetor = useMemo(() => {
    const map = new Map<string, number>();
    relatorioFiltrado.forEach((item) => {
      map.set(item.setor || 'Sem setor', (map.get(item.setor || 'Sem setor') || 0) + 1);
    });

    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [relatorioFiltrado]);

  const episVencidos = useMemo(() => {
    return relatorioFiltrado.filter((item) => {
      if (!item.validade_ate) return false;
      return getEntregaStatus(item.validade_ate).label === 'Vencido';
    });
  }, [relatorioFiltrado]);

  const episProximos = useMemo(() => {
    return relatorioFiltrado.filter((item) => {
      if (!item.validade_ate) return false;
      return getEntregaStatus(item.validade_ate).label === 'Próx. Vencimento';
    });
  }, [relatorioFiltrado]);

  const estoqueBaixo = useMemo(() => {
    return epis
      .map((epi) => {
        const totalDisp = lotes
          .filter((l) => Number(l.epi) === Number(epi.id))
          .reduce((acc, l) => acc + Number(l.disponivel || 0), 0);

        return {
          ...epi,
          estoque: totalDisp,
        };
      })
      .filter((e: any) => Number(e.estoque) <= Number(e.alerta_estoque_min || 0));
  }, [epis, lotes]);

  const lotesPorEpi = useMemo(() => {
    if (!filterEpi) return lotes;
    const epiSelecionado = epis.find((e) => e.nome === filterEpi);
    if (!epiSelecionado) return lotes;
    return lotes.filter((l) => Number(l.epi) === Number(epiSelecionado.id));
  }, [filterEpi, lotes, epis]);

  const funcionarioSelecionado = useMemo(
    () => funcionarios.find((f) => f.nome === filterFuncionario) || null,
    [funcionarios, filterFuncionario]
  );

  const handleExportExcel = async () => {
    try {
      setExportando(true);

      const xml = buildExcelXml(relatorioFiltrado);
      const blob = new Blob([xml], {
        type: 'application/vnd.ms-excel;charset=utf-8;',
      });

      downloadBlob(blob, 'relatorio_entregas_epi.xls');
      sucesso('Relatório exportado em Excel com sucesso.');
    } catch (e: any) {
      erro(e?.message || 'Falha ao exportar relatório.');
    } finally {
      setExportando(false);
    }
  };

  const handleExportPDF = () => {
    if (!filterFuncionario) {
      erro('Selecione um funcionário para gerar o PDF individual.');
      return;
    }

    const registrosFuncionario = relatorioFiltrado.filter((r) => r.funcionario_nome === filterFuncionario);

    if (!registrosFuncionario.length) {
      erro('Nenhum registro encontrado para o funcionário selecionado.');
      return;
    }

    const html = buildPdfHtml(filterFuncionario, registrosFuncionario, funcionarioSelecionado);
    const w = window.open('', '_blank', 'width=900,height=700');

    if (!w) {
      erro('Não foi possível abrir a janela do PDF. Libere pop-ups do navegador.');
      return;
    }

    w.document.open();
    w.document.write(html);
    w.document.close();
    sucesso('PDF preparado para impressão/salvar em PDF.');
  };

  const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    Ativo: 'success',
    'Próx. Vencimento': 'warning',
    Vencido: 'error',
    Substituído: 'info',
    Devolvido: 'default',
  };

  const renderReport = () => {
    switch (selectedReport) {
      case 'entregas_periodo':
        return (
          <Box>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Entregas Realizadas
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Protocolo</TableCell>
                        <TableCell>Funcionário</TableCell>
                        <TableCell>Setor</TableCell>
                        <TableCell>EPI</TableCell>
                        <TableCell>Categoria</TableCell>
                        <TableCell>Lote</TableCell>
                        <TableCell>Qtd</TableCell>
                        <TableCell>Data</TableCell>
                        <TableCell>Vencimento</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {relatorioFiltrado.map((e, index) => (
                        <TableRow key={e.id}>
                         <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#0B5ED7' }}>
                            {protocoloRelatorio(e, index)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{e.funcionario_nome}</TableCell>
                          <TableCell>{e.setor}</TableCell>
                          <TableCell>{e.epi_nome}</TableCell>
                          <TableCell>{e.categoria}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{e.lote || '—'}</TableCell>
                          <TableCell>{e.quantidade}</TableCell>
                          <TableCell>{formatDate(e.data_entrega)}</TableCell>
                          <TableCell>{formatDate(e.validade_ate || '')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
                  Total: {relatorioFiltrado.length} registro(s)
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case 'entregas_funcionario':
        return (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2.5 }}>Entregas por Funcionário</Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={entregasPorFunc} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5A6A7E' }} />
                    <YAxis dataKey="nome" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5A6A7E' }} width={160} />
                    <RechartsTooltip contentStyle={{ borderRadius: 10, border: '1px solid #E3E8EF' }} />
                    <Bar dataKey="total" fill="#0B5ED7" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        );

      case 'entregas_setor':
        return (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2.5 }}>Entregas por Setor</Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={entregasPorSetor} dataKey="value" nameKey="name" outerRadius={110} label>
                      {entregasPorSetor.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        );

      case 'epis_vencidos':
        return (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2.5 }}>EPIs Vencidos</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Protocolo</TableCell>
                      <TableCell>Funcionário</TableCell>
                      <TableCell>EPI</TableCell>
                      <TableCell>Setor</TableCell>
                      <TableCell>Vencimento</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {episVencidos.map((item) => {
                      const status = getEntregaStatus(item.validade_ate || '');
                      return (
                        <TableRow key={item.id}>
                          <TableCell sx={{ fontWeight: 700, color: '#0B5ED7' }}>{item.protocolo || '—'}</TableCell>
                          <TableCell>{item.funcionario_nome}</TableCell>
                          <TableCell>{item.epi_nome}</TableCell>
                          <TableCell>{item.setor}</TableCell>
                          <TableCell>{formatDate(item.validade_ate || '')}</TableCell>
                          <TableCell>
                            <StatusChip label={status.label} status={statusMap[status.label]} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );

      case 'epis_proximos':
        return (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2.5 }}>EPIs Próximos do Vencimento</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Protocolo</TableCell>
                      <TableCell>Funcionário</TableCell>
                      <TableCell>EPI</TableCell>
                      <TableCell>Setor</TableCell>
                      <TableCell>Vencimento</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {episProximos.map((item) => {
                      const status = getEntregaStatus(item.validade_ate || '');
                      return (
                        <TableRow key={item.id}>
                          <TableCell sx={{ fontWeight: 700, color: '#0B5ED7' }}>{item.protocolo || '—'}</TableCell>
                          <TableCell>{item.funcionario_nome}</TableCell>
                          <TableCell>{item.epi_nome}</TableCell>
                          <TableCell>{item.setor}</TableCell>
                          <TableCell>{formatDate(item.validade_ate || '')}</TableCell>
                          <TableCell>
                            <StatusChip label={status.label} status={statusMap[status.label]} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );

      case 'estoque_baixo':
        return (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2.5 }}>EPIs com Estoque Baixo</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>EPI</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Estoque Atual</TableCell>
                      <TableCell>Estoque Mínimo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {estoqueBaixo.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>{item.categoria}</TableCell>
                        <TableCell>{item.estoque}</TableCell>
                        <TableCell>{item.alerta_estoque_min}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );

      case 'lotes_epi':
        return (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2.5 }}>Lotes por EPI</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>EPI</TableCell>
                      <TableCell>Lote</TableCell>
                      <TableCell>Quantidade</TableCell>
                      <TableCell>Disponível</TableCell>
                      <TableCell>Compra</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lotesPorEpi.map((item) => {
                      const epi = epis.find((e) => Number(e.id) === Number(item.epi));
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{epi?.nome || `EPI #${item.epi}`}</TableCell>
                          <TableCell>{item.lote}</TableCell>
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>{item.disponivel}</TableCell>
                          <TableCell>{formatDate(item.data_compra)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Relatórios"
        subtitle="Indicadores, vencimentos e histórico de entregas de EPI"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportExcel}
              disabled={exportando || !relatorioFiltrado.length}
            >
              Exportar Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={handleExportPDF}
              disabled={exportando || !relatorioFiltrado.length}
            >
              Exportar PDF
            </Button>
          </Box>
        }
      />

      {loading ? (
        <Card>
          <CardContent>
            <LinearProgress />
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            {reportOptions.map((option) => (
              <Grid size={{ xs: 12, md: 1.5 }} key={option.key}>
                <Card
                  onClick={() => setSelectedReport(option.key)}
                  sx={{
                    cursor: 'pointer',
                    border:
                      selectedReport === option.key
                        ? `2px solid ${option.color}`
                        : '1px solid #E3E8EF',
                    boxShadow: selectedReport === option.key ? 4 : 1,
                    transition: 'all .2s ease',
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: `${option.color}15`,
                        color: option.color,
                      }}
                    >
                      {option.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.92rem' }}>{option.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card sx={{ mb: 2.5 }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 1.5 }}>
                  <TextField
                    fullWidth
                    select
                    label="Setor"
                    value={filterSetor}
                    onChange={(e) => setFilterSetor(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {setores.map((setor) => (
                      <MenuItem key={setor} value={setor}>
                        {setor}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 1.5 }}>
                  <TextField
                    fullWidth
                    select
                    label="Categoria"
                    value={filterCategoria}
                    onChange={(e) => setFilterCategoria(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {[...new Set(epis.map((e) => e.categoria).filter(Boolean))].map((categoria) => (
                      <MenuItem key={categoria} value={categoria}>
                        {categoria}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 1.5 }}>
                  <TextField
                    fullWidth
                    select
                    label="Funcionário"
                    value={filterFuncionario}
                    onChange={(e) => setFilterFuncionario(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {funcionarios.map((f) => (
                      <MenuItem key={f.id} value={f.nome}>
                        {f.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 1.5 }}>
                  <TextField
                    fullWidth
                    select
                    label="EPI"
                    value={filterEpi}
                    onChange={(e) => setFilterEpi(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {epis.map((e) => (
                      <MenuItem key={e.id} value={e.nome}>
                        {e.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Data de"
                    type="date"
                    value={dataDe}
                    onChange={(e) => setDataDe(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Data até"
                    type="date"
                    value={dataAte}
                    onChange={(e) => setDataAte(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <Assessment sx={{ color: '#0B5ED7' }} />
                    <Typography variant="body2" sx={{ color: '#5A6A7E' }}>
                      Registros encontrados: <strong>{relatorioFiltrado.length}</strong>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {selectedReport === 'entregas_periodo' && relatorioFiltrado.length === 0 && (
            <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
              Nenhum registro encontrado com os filtros atuais.
            </Alert>
          )}

          {renderReport()}
        </>
      )}
    </Box>
  );
};

export default RelatoriosPage;
