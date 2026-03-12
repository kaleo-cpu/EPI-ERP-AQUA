import { useEffect, useMemo, useState } from 'react';
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Shield,
  Inventory2,
  LocalShipping,
  People,
  Warning,
  Schedule,
  Info,
  TrendingUp,
  PersonOutline,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import PageHeader from '../components/PageHeader';
import InfoCard from '../components/InfoCard';
import TableCard from '../components/TableCard';
import StatusChip from '../components/StatusChip';
import AlertBanner from '../components/AlertBanner';
import {
  listarDashboardKPIs,
  listarMonitorValidade,
  listarAlertasEstoqueMinimo,
  listarEntregas,
  listarEPIs,
  listarFuncionarios,
  listarUsuarios,
  listarLotes,
  type DashboardKpis,
  type MonitorValidadeItem,
  type Entrega,
  type EPI,
  type Funcionario,
} from '../services/api';

const CHART_COLOR = '#0B5ED7';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState('');

  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [vencimentosApi, setVencimentosApi] = useState<MonitorValidadeItem[]>([]);
  const [alertasEstoque, setAlertasEstoque] = useState<
    Array<{ epi_id: number; epi__nome: string; epi__alerta_estoque_min: number; saldo: number }>
  >([]);

  const [epis, setEpis] = useState<EPI[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [lotesCount, setLotesCount] = useState(0);
  const [usuariosCount, setUsuariosCount] = useState<number | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        setErroCarregamento('');

        const results = await Promise.allSettled([
          listarDashboardKPIs(),
          listarMonitorValidade(30),
          listarAlertasEstoqueMinimo(),
          listarEPIs(),
          listarFuncionarios(),
          listarEntregas(),
          listarLotes(),
          listarUsuarios(),
        ]);

        const [
          kpisRes,
          vencimentosRes,
          alertasRes,
          episRes,
          funcionariosRes,
          entregasRes,
          lotesRes,
          usuariosRes,
        ] = results;

        if (kpisRes.status === 'fulfilled') setKpis(kpisRes.value);
        if (vencimentosRes.status === 'fulfilled') setVencimentosApi(vencimentosRes.value);
        if (alertasRes.status === 'fulfilled') setAlertasEstoque(alertasRes.value);
        if (episRes.status === 'fulfilled') setEpis(episRes.value);
        if (funcionariosRes.status === 'fulfilled') setFuncionarios(funcionariosRes.value);
        if (entregasRes.status === 'fulfilled') setEntregas(entregasRes.value);
        if (lotesRes.status === 'fulfilled') setLotesCount(lotesRes.value.length);

        if (usuariosRes.status === 'fulfilled') {
          setUsuariosCount(usuariosRes.value.length);
        } else {
          setUsuariosCount(null);
        }

        const allRejected = results.every((r) => r.status === 'rejected');
        if (allRejected) {
          setErroCarregamento('Não foi possível carregar os dados do dashboard.');
        } else {
          const falhas = results.filter((r) => r.status === 'rejected').length;
          if (falhas > 0) {
            setErroCarregamento('Parte dos dados do dashboard não pôde ser carregada, mas o restante foi exibido.');
          }
        }
      } catch (e: any) {
        setErroCarregamento(e?.message || 'Não foi possível carregar o dashboard.');
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  const epiMap = useMemo(() => {
    const map = new Map<number, EPI>();
    epis.forEach((e) => map.set(e.id, e));
    return map;
  }, [epis]);

  const funcionarioMap = useMemo(() => {
    const map = new Map<number, Funcionario>();
    funcionarios.forEach((f) => map.set(f.id, f));
    return map;
  }, [funcionarios]);

  const funcionariosAtivos = useMemo(
    () => funcionarios.filter((f) => f.status === 'ativo').length,
    [funcionarios]
  );

  const vencimentosFallback = useMemo(() => {
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + 30);

    return entregas
      .filter((e) => e.data_validade_prevista)
      .map((e) => {
        const func = funcionarioMap.get(e.funcionario);
        const epi = epiMap.get(e.epi);
        return {
          funcionario__nome: func?.nome || `Funcionário #${e.funcionario}`,
          funcionario__setor: func?.setor || '—',
          epi__nome: epi?.nome || `EPI #${e.epi}`,
          data_validade_prevista: e.data_validade_prevista as string,
        };
      })
      .filter((item) => {
        const data = new Date(item.data_validade_prevista);
        return !isNaN(data.getTime()) && data >= hoje && data <= limite;
      })
      .sort(
        (a, b) =>
          new Date(a.data_validade_prevista).getTime() -
          new Date(b.data_validade_prevista).getTime()
      )
      .slice(0, 20);
  }, [entregas, funcionarioMap, epiMap]);

  const vencimentos = vencimentosApi.length > 0 ? vencimentosApi : vencimentosFallback;

  const consumoPorSetorChart = useMemo(() => {
    if (kpis?.consumo_por_setor?.length) {
      return kpis.consumo_por_setor.slice(0, 6).map((item) => ({
        setor: item.funcionario__setor || '—',
        total: item.total || 0,
      }));
    }

    const mapa: Record<string, number> = {};

    entregas.forEach((e) => {
      const func = funcionarioMap.get(e.funcionario);
      const setor = func?.setor || '—';
      mapa[setor] = (mapa[setor] || 0) + Number(e.quantidade || 0);
    });

    return Object.entries(mapa)
      .map(([setor, total]) => ({ setor, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [kpis, entregas, funcionarioMap]);

  const topConsumidores = useMemo(() => {
    if (kpis?.top_consumidores?.length) {
      return kpis.top_consumidores.slice(0, 6).map((item) => ({
        funcionario__nome: item.funcionario__nome || '—',
        total: item.total || 0,
      }));
    }

    const mapa: Record<string, number> = {};

    entregas.forEach((e) => {
      const func = funcionarioMap.get(e.funcionario);
      const nome = func?.nome || `Funcionário #${e.funcionario}`;
      mapa[nome] = (mapa[nome] || 0) + Number(e.quantidade || 0);
    });

    return Object.entries(mapa)
      .map(([funcionario__nome, total]) => ({ funcionario__nome, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [kpis, entregas, funcionarioMap]);

  const entregasUltimosMeses = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
    const hoje = new Date();
    const meses: Array<{ mes: string; entregas: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesNum = d.getMonth();
      const anoNum = d.getFullYear();

      const count = entregas.filter((item) => {
        const data = new Date(item.data_entrega);
        return data.getMonth() === mesNum && data.getFullYear() === anoNum;
      }).length;

      meses.push({
        mes: formatter.format(d).replace('.', ''),
        entregas: count,
      });
    }

    return meses;
  }, [entregas]);

  const movimentacoesRecentes = useMemo(() => {
    return [...entregas]
      .sort((a, b) => new Date(b.data_entrega).getTime() - new Date(a.data_entrega).getTime())
      .slice(0, 8)
      .map((item) => {
        const funcionario = funcionarioMap.get(item.funcionario);
        const epi = epiMap.get(item.epi);

        const validade = item.data_validade_prevista ? new Date(item.data_validade_prevista) : null;
        const hoje = new Date();
        let status: 'Concluído' | 'Pendente' | 'Vencido' = 'Concluído';

        if (validade) {
          const diff = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          if (diff < 0) status = 'Vencido';
          else if (diff <= 30) status = 'Pendente';
        }

        return {
          tipo: 'Entrega',
          funcionario: funcionario?.nome || `Funcionário #${item.funcionario}`,
          epi: epi?.nome || `EPI #${item.epi}`,
          quantidade: item.quantidade,
          data: new Date(item.data_entrega).toLocaleString('pt-BR'),
          status,
        };
      });
  }, [entregas, funcionarioMap, epiMap]);

  const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    Concluído: 'success',
    Pendente: 'warning',
    Vencido: 'error',
  };

  const tipoMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    Entrega: 'info',
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Dashboard" subtitle="Visão geral do sistema ERP-EPI" />
        <Card>
          <CardContent>
            <LinearProgress />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Visão geral do sistema ERP-EPI" />

      {erroCarregamento && (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
          {erroCarregamento}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <InfoCard title="EPIs Cadastrados" value={epis.length} icon={<Shield />} color="#0B5ED7" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <InfoCard title="Lotes Ativos" value={lotesCount} icon={<Inventory2 />} color="#2E7D32" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <InfoCard title="Entregas" value={entregas.length} icon={<LocalShipping />} color="#F57F17" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <InfoCard title="Funcionários Ativos" value={funcionariosAtivos} icon={<People />} color="#071A2B" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <InfoCard title="Próx. Vencimentos" value={vencimentos.length} icon={<Schedule />} color="#C62828" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <InfoCard
            title="Usuários"
            value={usuariosCount ?? '—'}
            icon={<PersonOutline />}
            color="#6A1B9A"
            trend={usuariosCount === null ? 'Sem permissão admin' : undefined}
          />
        </Grid>
      </Grid>

      {alertasEstoque.length > 0 && (
        <AlertBanner severity="warning" title="Atenção — Itens com estoque abaixo do mínimo">
          {alertasEstoque
            .slice(0, 5)
            .map((a) => `${a.epi__nome}: ${a.saldo}/${a.epi__alerta_estoque_min}`)
            .join(' • ')}
        </AlertBanner>
      )}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                Consumo por Setor
              </Typography>
              <Typography variant="body2" sx={{ mb: 2.5 }}>
                Ranking dos setores com maior consumo de EPIs
              </Typography>

              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consumoPorSetorChart} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" vertical={false} />
                    <XAxis
                      dataKey="setor"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#5A6A7E' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#5A6A7E' }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid #E3E8EF',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {consumoPorSetorChart.map((_, index) => (
                        <Cell key={index} fill={index === 0 ? '#FFC400' : CHART_COLOR} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Próximos Vencimentos
              </Typography>

              <List disablePadding>
                {vencimentos.slice(0, 6).map((item, index) => (
                  <ListItem
                    key={`${item.funcionario__nome}-${item.epi__nome}-${index}`}
                    sx={{
                      px: 1.5,
                      py: 1,
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: '#FFFDE7',
                      border: '1px solid #FFF9C4',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Warning sx={{ color: '#F57F17' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${item.funcionario__nome} • ${item.epi__nome}`}
                      secondary={`${item.funcionario__setor || '—'} • vence em ${new Date(
                        item.data_validade_prevista
                      ).toLocaleDateString('pt-BR')}`}
                      primaryTypographyProps={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#0E1B2A',
                      }}
                      secondaryTypographyProps={{ fontSize: '0.7rem' }}
                    />
                  </ListItem>
                ))}

                {!vencimentos.length && (
                  <ListItem sx={{ px: 1.5, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Info sx={{ color: '#0B5ED7' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Nenhum vencimento próximo encontrado"
                      primaryTypographyProps={{
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        color: '#5A6A7E',
                      }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                Entregas por Período
              </Typography>
              <Typography variant="body2" sx={{ mb: 2.5 }}>
                Últimos 6 meses
              </Typography>

              <Box sx={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={entregasUltimosMeses} barSize={30}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" vertical={false} />
                    <XAxis
                      dataKey="mes"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#5A6A7E' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#5A6A7E' }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid #E3E8EF',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar dataKey="entregas" radius={[6, 6, 0, 0]}>
                      {entregasUltimosMeses.map((_, index) => (
                        <Cell
                          key={index}
                          fill={index === entregasUltimosMeses.length - 1 ? '#FFC400' : CHART_COLOR}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Top Consumidores
              </Typography>

              <List disablePadding>
                {topConsumidores.slice(0, 6).map((item, index) => (
                  <ListItem
                    key={`${item.funcionario__nome}-${index}`}
                    sx={{
                      px: 1.5,
                      py: 1,
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: '#F4F6F9',
                      border: '1px solid #E3E8EF',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {index === 0 ? (
                        <TrendingUp sx={{ color: '#2E7D32' }} />
                      ) : (
                        <Info sx={{ color: '#0B5ED7' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.funcionario__nome || '—'}
                      secondary={`Total consumido: ${item.total}`}
                      primaryTypographyProps={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#0E1B2A',
                      }}
                      secondaryTypographyProps={{ fontSize: '0.72rem' }}
                    />
                  </ListItem>
                ))}

                {!topConsumidores.length && (
                  <ListItem sx={{ px: 1.5, py: 1 }}>
                    <ListItemText
                      primary="Sem dados de consumo ainda"
                      primaryTypographyProps={{
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        color: '#5A6A7E',
                      }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableCard
        title="Movimentações Recentes"
        subtitle="Últimas entregas registradas no sistema"
        columns={[
          {
            key: 'tipo',
            label: 'Tipo',
            render: (val: string) => <StatusChip label={val} status={tipoMap[val] || 'default'} />,
          },
          { key: 'funcionario', label: 'Funcionário' },
          { key: 'epi', label: 'EPI' },
          { key: 'quantidade', label: 'Qtd' },
          { key: 'data', label: 'Data/Hora' },
          {
            key: 'status',
            label: 'Status',
            render: (val: string) => <StatusChip label={val} status={statusMap[val] || 'default'} />,
          },
        ]}
        rows={movimentacoesRecentes}
      />
    </Box>
  );
};

export default DashboardPage;