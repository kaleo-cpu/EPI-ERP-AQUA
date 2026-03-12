import { useEffect, useMemo, useState } from 'react';
import { useNotificacao } from '../components/NotificacaoProvider';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Typography,
  Autocomplete,
  Drawer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import { Add, Close, History, Visibility } from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import TableCard from '../components/TableCard';
import UserAvatarCircle from '../components/UserAvatarCircle';
import SearchToolbar from '../components/SearchToolbar';
import * as api from '../services/api';
import type {
  Entrega,
  EntregaInput,
  EntregaRelatorio,
  EPI,
  Lote,
  Funcionario,
} from '../services/api';

const emptyForm = {
  funcionario_id: null as number | null,
  epi_id: null as number | null,
  lote_id: null as number | null,
  quantidade: 1,
  verif_facial_score: 0,
};

const pad = (value: number | string, size = 2) => String(value).padStart(size, '0');

const parseEntregaDate = (value?: string | null) => {
  if (!value) return new Date();

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date;

  const parts = value.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts.map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  return new Date();
};

const gerarProtocoloEntrega = ({
  dataEntrega,
  funcionarioId,
  ordemEntrega,
}: {
  dataEntrega?: string | null;
  funcionarioId: number;
  ordemEntrega: number;
}) => {
  const data = parseEntregaDate(dataEntrega);
  const ano = String(data.getFullYear()).slice(-2);
  const dia = pad(data.getDate(), 2);
  const funcionario = pad(funcionarioId, 4);
  const ordem = pad(ordemEntrega, 4);

  return `${ano}-${dia}-${funcionario}-${ordem}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';

  if (value.includes('T')) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
  }

  const parts = value.split('-');
  if (parts.length !== 3) return value;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
};

const formatDateOnly = (value?: string | null) => {
  if (!value) return '—';
  const parts = value.split('-');
  if (parts.length !== 3) return value;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
};

const getEntregaStatus = (validade: string) => {
  const hoje = new Date();
  const venc = new Date(validade);

  if (Number.isNaN(venc.getTime())) {
    return { label: 'Ativo', status: 'success' as const };
  }

  const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { label: 'Vencido', status: 'error' as const };
  if (diff <= 30) return { label: 'Próx. Vencimento', status: 'warning' as const };
  return { label: 'Ativo', status: 'success' as const };
};

const EntregasPage = () => {
  const { sucesso, erro } = useNotificacao();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [epis, setEpis] = useState<EPI[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFuncionario, setHistoryFuncionario] = useState<Funcionario | null>(null);
  const [funcHistory, setFuncHistory] = useState<EntregaRelatorio[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const carregarTudo = async () => {
    try {
      setLoading(true);

      const [episResp, lotesResp, funcsResp, entregasResp] = await Promise.all([
        api.listarEPIs(),
        api.listarLotes(),
        api.listarFuncionarios(),
        api.listarEntregas(),
      ]);

      setEpis(episResp ?? []);
      setLotes(lotesResp ?? []);
      setFuncionarios(funcsResp ?? []);
      setEntregas(entregasResp ?? []);
    } catch (e: any) {
      erro(e?.message || 'Falha ao carregar entregas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  const funcionarioMap = useMemo(() => {
    const map = new Map<number, Funcionario>();
    funcionarios.forEach((item) => map.set(item.id, item));
    return map;
  }, [funcionarios]);

  const epiMap = useMemo(() => {
    const map = new Map<number, EPI>();
    epis.forEach((item) => map.set(item.id, item));
    return map;
  }, [epis]);

  const lotesDisponiveis = useMemo(() => {
    if (!form.epi_id) return [];
    return lotes.filter((l) => Number(l.epi) === Number(form.epi_id) && Number(l.disponivel) > 0);
  }, [lotes, form.epi_id]);

  const selectedFuncionario = useMemo(
    () => funcionarios.find((f) => f.id === form.funcionario_id) || null,
    [funcionarios, form.funcionario_id]
  );

  const selectedEpi = useMemo(
    () => epis.find((e) => e.id === form.epi_id) || null,
    [epis, form.epi_id]
  );

  const selectedLote = useMemo(
    () => lotes.find((l) => l.id === form.lote_id) || null,
    [lotes, form.lote_id]
  );

  const orderedEntregas = useMemo(() => {
    return [...entregas].sort((a, b) => {
      const dateA = parseEntregaDate(a.data_entrega).getTime();
      const dateB = parseEntregaDate(b.data_entrega).getTime();

      if (dateA !== dateB) return dateA - dateB;
      return a.id - b.id;
    });
  }, [entregas]);

  const proximoNumeroOrdem = useMemo(() => orderedEntregas.length + 1, [orderedEntregas]);

  const protocoloPreview = useMemo(() => {
    if (!form.funcionario_id) return '';
    return gerarProtocoloEntrega({
      dataEntrega: new Date().toISOString(),
      funcionarioId: Number(form.funcionario_id),
      ordemEntrega: proximoNumeroOrdem,
    });
  }, [form.funcionario_id, proximoNumeroOrdem]);

  const filteredRows = useMemo(() => {
    const term = search.toLowerCase().trim();

    return orderedEntregas
      .map((item, index) => {
        const funcionario = funcionarioMap.get(item.funcionario);
        const epi = epiMap.get(item.epi);
        const status = getEntregaStatus(item.data_validade_prevista || '');

        return {
          ...item,
          funcionario_nome: funcionario?.nome || `Funcionário #${item.funcionario}`,
          setor: funcionario?.setor || '—',
          epi_nome: epi?.nome || `EPI #${item.epi}`,
          status_label: status.label,
          status_type: status.status,
          protocolo:
            item.protocolo ||
            gerarProtocoloEntrega({
              dataEntrega: item.data_entrega,
              funcionarioId: Number(item.funcionario),
              ordemEntrega: index + 1,
            }),
        };
      })
      .filter((row) => {
        if (!term) return true;
        return (
          String(row.funcionario_nome || '').toLowerCase().includes(term) ||
          String(row.epi_nome || '').toLowerCase().includes(term) ||
          String(row.lote || '').toLowerCase().includes(term) ||
          String(row.setor || '').toLowerCase().includes(term) ||
          String(row.protocolo || '').toLowerCase().includes(term)
        );
      });
  }, [orderedEntregas, funcionarioMap, epiMap, search]);

  const vencimentoPrevisto = useMemo(() => {
    if (!selectedEpi) return '';
    const data = new Date();
    data.setDate(data.getDate() + Number(selectedEpi.tempo_validade_dias || 0));
    return data.toLocaleDateString('pt-BR');
  }, [selectedEpi]);

  const openHistory = async (func: Funcionario) => {
    setHistoryFuncionario(func);
    setHistoryOpen(true);

    try {
      setLoadingHistory(true);
      const data = await api.listarEntregasRelatorio({ funcionario_id: func.id });
      setFuncHistory(data ?? []);
    } catch (e: any) {
      erro(e?.message || 'Falha ao carregar histórico.');
      setFuncHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const salvarEntrega = async () => {
    try {
      if (!form.funcionario_id || !form.epi_id || !form.lote_id) {
        erro('Selecione funcionário, EPI e lote.');
        return;
      }

      if (Number(form.quantidade || 0) <= 0) {
        erro('Informe uma quantidade válida.');
        return;
      }

      if (selectedLote && Number(form.quantidade) > Number(selectedLote.disponivel)) {
        erro('A quantidade informada é maior que o saldo disponível do lote.');
        return;
      }

      const payload: EntregaInput = {
        funcionario_id: Number(form.funcionario_id),
        epi_id: Number(form.epi_id),
        lote_id: Number(form.lote_id),
        quantidade: Number(form.quantidade || 1),
        verif_facial_score: Number(form.verif_facial_score || 0),
      };

      const novaEntrega = await api.registrarEntrega(payload);

      sucesso(
        `Entrega registrada com sucesso. Protocolo: ${
          novaEntrega?.protocolo || protocoloPreview || 'gerado'
        }`
      );

      setFormOpen(false);
      setForm(emptyForm);
      await carregarTudo();
    } catch (e: any) {
      erro(e?.message || 'Não foi possível registrar a entrega.');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Entregas de EPI"
        subtitle="Controle de entregas, validade e protocolo único das entregas"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => setFormOpen(true)}>
            Nova Entrega
          </Button>
        }
      />

      <SearchToolbar
        placeholder="Buscar por funcionário, setor, EPI, lote ou protocolo..."
        value={search}
        onChange={setSearch}
      />

      {loading ? (
        <Card>
          <CardContent>
            <LinearProgress />
          </CardContent>
        </Card>
      ) : (
        <TableCard
          columns={[
            {
              key: 'protocolo',
              label: 'Protocolo',
              render: (val: string) => (
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0B5ED7' }}>
                  {val}
                </Typography>
              ),
            },
            {
              key: 'funcionario_nome',
              label: 'Funcionário',
              render: (val: string, row: any) => <UserAvatarCircle name={val} subtitle={`${row.setor}`} />,
            },
            { key: 'epi_nome', label: 'EPI' },
            { key: 'lote', label: 'Lote' },
            { key: 'quantidade', label: 'Qtd.' },
            {
              key: 'data_entrega',
              label: 'Data Entrega',
              render: (val: string) => formatDate(val),
            },
            {
              key: 'data_validade_prevista',
              label: 'Validade',
              render: (val: string) => formatDateOnly(val),
            },
            {
              key: 'status_label',
              label: 'Status',
              render: (val: string, row: any) => <StatusChip label={val} status={row.status_type} />,
            },
            {
              key: 'id',
              label: 'Ações',
              render: (_: any, row: any) => {
                const funcionario = funcionarios.find((f) => f.id === row.funcionario);
                return (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Histórico do funcionário">
                      <IconButton
                        size="small"
                        onClick={() => funcionario && openHistory(funcionario)}
                        sx={{ color: '#0B5ED7' }}
                      >
                        <History fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Visualizar">
                      <IconButton size="small" sx={{ color: '#5A6A7E' }}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                );
              },
            },
          ]}
          rows={filteredRows}
        />
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Nova Entrega de EPI
          <IconButton onClick={() => setFormOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={funcionarios.filter((f) => f.status === 'ativo')}
                value={selectedFuncionario}
                onChange={(_, value) => setForm({ ...form, funcionario_id: value?.id || null })}
                getOptionLabel={(option) => option.nome}
                renderInput={(params) => <TextField {...params} label="Funcionário" size="small" />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Setor" value={selectedFuncionario?.setor || ''} size="small" disabled />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={epis}
                value={selectedEpi}
                onChange={(_, value) => setForm({ ...form, epi_id: value?.id || null, lote_id: null })}
                getOptionLabel={(option) => option.nome}
                renderInput={(params) => <TextField {...params} label="EPI" size="small" />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Lote"
                value={form.lote_id || ''}
                onChange={(e) => setForm({ ...form, lote_id: Number(e.target.value) })}
                size="small"
                disabled={!form.epi_id}
              >
                {lotesDisponiveis.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.lote || 'Sem código'} — Disponível: {item.disponivel}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Quantidade"
                type="number"
                value={form.quantidade}
                onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Score Facial"
                type="number"
                value={form.verif_facial_score}
                onChange={(e) => setForm({ ...form, verif_facial_score: Number(e.target.value) })}
                size="small"
                helperText="Opcional"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Validade Prevista" value={vencimentoPrevisto} size="small" disabled />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Saldo do Lote"
                value={selectedLote ? `${selectedLote.disponivel} un` : ''}
                size="small"
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Protocolo da Entrega"
                value={protocoloPreview}
                size="small"
                disabled
                helperText="Gerado automaticamente ao registrar a entrega"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="ID do Funcionário"
                value={selectedFuncionario?.id || ''}
                size="small"
                disabled
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Ordem da Entrega"
                value={pad(proximoNumeroOrdem, 4)}
                size="small"
                disabled
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: '#F4F6F9',
              borderRadius: 2,
              border: '1px dashed #E3E8EF',
            }}
          >
            <Typography variant="body2" sx={{ color: '#9CA3AF', fontStyle: 'italic' }}>
              O protocolo é gerado automaticamente no padrão AA-DD-ID-OR, onde AA = ano, DD = dia,
              ID = identificador do funcionário e OR = ordem sequencial da entrega.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setFormOpen(false)} sx={{ borderColor: '#E3E8EF', color: '#5A6A7E' }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvarEntrega}>
            Registrar Entrega
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 760 }, p: 0 } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5">Histórico de Entregas</Typography>
              {historyFuncionario && (
                <Box sx={{ mt: 1 }}>
                  <UserAvatarCircle
                    name={historyFuncionario.nome}
                    subtitle={`${historyFuncionario.funcao} — ${historyFuncionario.setor}`}
                    size={42}
                  />
                </Box>
              )}
            </Box>
            <IconButton onClick={() => setHistoryOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {loadingHistory ? (
            <LinearProgress />
          ) : funcHistory.length === 0 ? (
            <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: '#9CA3AF' }}>
              Nenhuma entrega registrada.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Protocolo</TableCell>
                    <TableCell>EPI</TableCell>
                    <TableCell>Lote</TableCell>
                    <TableCell>Qtd.</TableCell>
                    <TableCell>Entrega</TableCell>
                    <TableCell>Vencimento</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {funcHistory.map((e, index) => {
                    const status = getEntregaStatus(e.validade_ate || '');
                    const ordemEntrega = filteredRows.findIndex((row) => row.id === e.id) + 1 || index + 1;
                    const protocolo =
                      e.protocolo ||
                      gerarProtocoloEntrega({
                        dataEntrega: e.data_entrega,
                        funcionarioId: historyFuncionario?.id || 0,
                        ordemEntrega,
                      });

                    return (
                      <TableRow key={e.id}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#0B5ED7' }}>
                          {protocolo}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{e.epi_nome}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{e.lote || '—'}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{e.quantidade}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(e.data_entrega)}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{formatDateOnly(e.validade_ate || '')}</TableCell>
                        <TableCell>
                          <StatusChip label={status.label} status={status.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default EntregasPage;