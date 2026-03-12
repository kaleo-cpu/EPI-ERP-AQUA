import { useEffect, useMemo, useState } from 'react';
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
  Chip,
  Drawer,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Close,
  Inventory2,
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import SearchToolbar from '../components/SearchToolbar';
import TableCard from '../components/TableCard';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';
import { useNotificacao } from '../components/NotificacaoProvider';
import {
  listarEPIs,
  criarEPI,
  editarEPI,
  excluirEPI,
  listarLotes,
  criarLote,
  editarLote,
  excluirLote,
  categoriasEPI,
  type EPI,
  type EPIInput,
  type Lote,
  type LoteInput,
} from '../services/api';

const catColorMap: Record<string, string> = {
  calçado: '#6A1B9A',
  ocular: '#00838F',
  respiratória: '#E65100',
  auditiva: '#1565C0',
  cabeça: '#2E7D32',
  mãos: '#F57F17',
  corpo: '#C62828',
  outros: '#5A6A7E',
};

const catLabelMap = categoriasEPI.reduce<Record<string, string>>((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const emptyEPI: EPIInput = {
  nome: '',
  categoria: 'outros',
  tempo_validade_dias: 180,
  numero_ca: '',
  validade_ca: null,
  fabricante: '',
  modelo: '',
  unidade: 'un',
  alerta_estoque_min: 0,
  observacoes: '',
};

const makeEmptyLote = (epiId = 0): LoteInput => ({
  epi: epiId,
  lote: '',
  nf_numero: '',
  nf_serie: '1',
  fornecedor_cnpj: '',
  data_compra: '',
  quantidade: 0,
  local_armazenamento: '',
});

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const [y, m, d] = value.split('-');
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
};

const EPIsPage = () => {
  const { sucesso, erro } = useNotificacao();

  const [loading, setLoading] = useState(true);
  const [loadingLotes, setLoadingLotes] = useState(false);

  const [epis, setEpis] = useState<EPI[]>([]);
  const [allLotes, setAllLotes] = useState<Lote[]>([]);

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EPIInput>(emptyEPI);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EPI | null>(null);

  const [lotesDrawerOpen, setLotesDrawerOpen] = useState(false);
  const [selectedEpi, setSelectedEpi] = useState<EPI | null>(null);
  const [epiLotes, setEpiLotes] = useState<Lote[]>([]);
  const [loteFormOpen, setLoteFormOpen] = useState(false);
  const [loteForm, setLoteForm] = useState<LoteInput>(makeEmptyLote());
  const [loteEditId, setLoteEditId] = useState<number | null>(null);
  const [loteDeleteOpen, setLoteDeleteOpen] = useState(false);
  const [loteDeleteTarget, setLoteDeleteTarget] = useState<Lote | null>(null);

  const carregarTudo = async () => {
    try {
      setLoading(true);
      const [episResp, lotesResp] = await Promise.all([listarEPIs(), listarLotes()]);
      setEpis(episResp);
      setAllLotes(lotesResp);
    } catch (e: any) {
      erro(e?.message || 'Falha ao carregar EPIs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  const filtered = useMemo(() => {
    const t = search.toLowerCase().trim();
    if (!t) return epis;

    return epis.filter((item) => {
      const categoriaLabel = catLabelMap[item.categoria]?.toLowerCase() || '';
      return (
        item.nome.toLowerCase().includes(t) ||
        item.categoria.toLowerCase().includes(t) ||
        categoriaLabel.includes(t) ||
        item.numero_ca.toLowerCase().includes(t) ||
        item.fabricante.toLowerCase().includes(t) ||
        item.modelo.toLowerCase().includes(t)
      );
    });
  }, [epis, search]);

  const getEstoque = (epiId: number) => {
    return allLotes
      .filter((l) => Number(l.epi) === Number(epiId))
      .reduce((sum, l) => sum + Number(l.disponivel || 0), 0);
  };

  const getEstoqueStatus = (epi: EPI) => {
    const est = getEstoque(epi.id);
    if (est === 0) return { label: 'Sem Estoque', status: 'error' as const };
    if (est <= epi.alerta_estoque_min) return { label: 'Estoque Baixo', status: 'warning' as const };
    return { label: 'Normal', status: 'success' as const };
  };

  const openNovoEPI = () => {
    setForm(emptyEPI);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditarEPI = (item: EPI) => {
    setForm({
      nome: item.nome,
      categoria: item.categoria,
      tempo_validade_dias: item.tempo_validade_dias,
      numero_ca: item.numero_ca,
      validade_ca: item.validade_ca,
      fabricante: item.fabricante,
      modelo: item.modelo,
      unidade: item.unidade,
      alerta_estoque_min: item.alerta_estoque_min,
      observacoes: item.observacoes,
    });
    setEditingId(item.id);
    setFormOpen(true);
  };

  const salvarEPI = async () => {
    try {
      const payload: EPIInput = {
        ...form,
        tempo_validade_dias: Number(form.tempo_validade_dias || 0),
        alerta_estoque_min: Number(form.alerta_estoque_min || 0),
        validade_ca: form.validade_ca || null,
      };

      if (editingId) {
        await editarEPI(editingId, payload);
        sucesso('EPI atualizado com sucesso.');
      } else {
        await criarEPI(payload);
        sucesso('EPI cadastrado com sucesso.');
      }

      setFormOpen(false);
      await carregarTudo();
    } catch (e: any) {
      erro(e?.message || 'Não foi possível salvar o EPI.');
    }
  };

  const confirmarExclusaoEPI = async () => {
    if (!deleteTarget) return;

    try {
      await excluirEPI(deleteTarget.id);
      sucesso('EPI excluído com sucesso.');
      setDeleteOpen(false);
      setDeleteTarget(null);
      await carregarTudo();
    } catch (e: any) {
      erro(e?.message || 'Não foi possível excluir o EPI.');
    }
  };

  const openLotes = async (epi: EPI) => {
    setSelectedEpi(epi);
    setLotesDrawerOpen(true);
    setLoteForm(makeEmptyLote(epi.id));
    setLoteEditId(null);

    try {
      setLoadingLotes(true);
      const lotes = await listarLotes(epi.id);
      setEpiLotes(lotes);
    } catch (e: any) {
      erro(e?.message || 'Não foi possível carregar os lotes.');
    } finally {
      setLoadingLotes(false);
    }
  };

  const recarregarLotesDoEPI = async () => {
    if (!selectedEpi) return;

    try {
      setLoadingLotes(true);
      const [lotesDoEpi, lotesGerais] = await Promise.all([
        listarLotes(selectedEpi.id),
        listarLotes(),
      ]);
      setEpiLotes(lotesDoEpi);
      setAllLotes(lotesGerais);
    } catch (e: any) {
      erro(e?.message || 'Falha ao atualizar lotes.');
    } finally {
      setLoadingLotes(false);
    }
  };

  const openNovoLote = () => {
    if (!selectedEpi) return;
    setLoteForm(makeEmptyLote(selectedEpi.id));
    setLoteEditId(null);
    setLoteFormOpen(true);
  };

  const openEditarLote = (item: Lote) => {
    setLoteForm({
      epi: item.epi,
      lote: item.lote,
      nf_numero: item.nf_numero,
      nf_serie: item.nf_serie,
      fornecedor_cnpj: item.fornecedor_cnpj,
      data_compra: item.data_compra,
      quantidade: item.quantidade,
      local_armazenamento: item.local_armazenamento,
    });
    setLoteEditId(item.id);
    setLoteFormOpen(true);
  };

  const salvarLote = async () => {
    try {
      const payload: LoteInput = {
        ...loteForm,
        epi: Number(selectedEpi?.id || loteForm.epi),
        quantidade: Number(loteForm.quantidade || 0),
      };

      if (loteEditId) {
        await editarLote(loteEditId, payload);
        sucesso('Lote atualizado com sucesso.');
      } else {
        await criarLote(payload);
        sucesso('Lote cadastrado com sucesso.');
      }

      setLoteFormOpen(false);
      await recarregarLotesDoEPI();
    } catch (e: any) {
      erro(e?.message || 'Não foi possível salvar o lote.');
    }
  };

  const confirmarExclusaoLote = async () => {
    if (!loteDeleteTarget) return;

    try {
      await excluirLote(loteDeleteTarget.id);
      sucesso('Lote excluído com sucesso.');
      setLoteDeleteOpen(false);
      setLoteDeleteTarget(null);
      await recarregarLotesDoEPI();
    } catch (e: any) {
      erro(e?.message || 'Não foi possível excluir o lote.');
    }
  };

  return (
    <Box>
      <PageHeader
        title="EPIs"
        subtitle="Gerenciamento de Equipamentos de Proteção Individual"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={openNovoEPI}>
            Novo EPI
          </Button>
        }
      />

      <SearchToolbar
        placeholder="Buscar por nome, categoria, CA, fabricante ou modelo..."
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
              key: 'nome',
              label: 'EPI',
              render: (val: string, row: EPI) => (
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{val}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                    {row.fabricante || '—'} — {row.modelo || '—'}
                  </Typography>
                </Box>
              ),
            },
            {
              key: 'categoria',
              label: 'Categoria',
              render: (val: string) => (
                <Chip
                  label={catLabelMap[val] || val}
                  size="small"
                  sx={{
                    bgcolor: `${catColorMap[val] || '#5A6A7E'}14`,
                    color: catColorMap[val] || '#5A6A7E',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                  }}
                />
              ),
            },
            { key: 'numero_ca', label: 'C.A.' },
            {
              key: 'validade_ca',
              label: 'Val. C.A.',
              render: (val: string | null) => formatDate(val),
            },
            {
              key: 'tempo_validade_dias',
              label: 'Validade',
              render: (val: number) => <Typography variant="body2">{val} dias</Typography>,
            },
            {
              key: 'id',
              label: 'Estoque',
              render: (_: any, row: EPI) => {
                const est = getEstoque(row.id);
                const info = getEstoqueStatus(row);
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>{est}</Typography>
                    <StatusChip label={info.label} status={info.status} />
                  </Box>
                );
              },
            },
            {
              key: 'alerta_estoque_min',
              label: 'Mín.',
              render: (val: number) => (
                <Chip
                  label={`Alerta: ${val}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', borderColor: '#E3E8EF' }}
                />
              ),
            },
            {
              key: 'observacoes',
              label: 'Ações',
              render: (_: any, row: EPI) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Gerenciar Lotes">
                    <IconButton size="small" onClick={() => openLotes(row)} sx={{ color: '#0B5ED7' }}>
                      <Inventory2 fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => openEditarEPI(row)} sx={{ color: '#5A6A7E' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeleteTarget(row);
                        setDeleteOpen(true);
                      }}
                      sx={{ color: '#E53935' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ),
            },
          ]}
          rows={filtered}
        />
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingId ? 'Editar EPI' : 'Novo EPI'}
          <IconButton onClick={() => setFormOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                select
                label="Categoria"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value as EPIInput['categoria'] })}
                size="small"
              >
                {categoriasEPI.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Validade (dias)"
                type="number"
                value={form.tempo_validade_dias}
                onChange={(e) => setForm({ ...form, tempo_validade_dias: Number(e.target.value) })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Número CA"
                value={form.numero_ca}
                onChange={(e) => setForm({ ...form, numero_ca: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Validade do CA"
                type="date"
                value={form.validade_ca || ''}
                onChange={(e) => setForm({ ...form, validade_ca: e.target.value || null })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Fabricante"
                value={form.fabricante}
                onChange={(e) => setForm({ ...form, fabricante: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Modelo"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Unidade"
                value={form.unidade}
                onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Alerta estoque mínimo"
                type="number"
                value={form.alerta_estoque_min}
                onChange={(e) => setForm({ ...form, alerta_estoque_min: Number(e.target.value) })}
                size="small"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Observações"
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                size="small"
                multiline
                minRows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setFormOpen(false)} sx={{ borderColor: '#E3E8EF', color: '#5A6A7E' }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvarEPI}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        title="Excluir EPI"
        message={`Deseja excluir o EPI "${deleteTarget?.nome}"?`}
        confirmLabel="Excluir"
        onConfirm={confirmarExclusaoEPI}
        onCancel={() => setDeleteOpen(false)}
        destructive
      />

      <Drawer
        anchor="right"
        open={lotesDrawerOpen}
        onClose={() => setLotesDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', md: 680 } } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Lotes do EPI
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                {selectedEpi?.nome}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" startIcon={<Add />} onClick={openNovoLote}>
                Novo lote
              </Button>
              <IconButton onClick={() => setLotesDrawerOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </Box>

          {loadingLotes ? (
            <LinearProgress sx={{ mb: 2 }} />
          ) : (
            <Grid container spacing={1.5}>
              {epiLotes.map((lote) => {
                const pct = lote.quantidade > 0 ? (Number(lote.disponivel || 0) / Number(lote.quantidade || 0)) * 100 : 0;
                const status = pct === 0 ? 'error' : pct <= 20 ? 'warning' : 'success';
                const label = pct === 0 ? 'Esgotado' : pct <= 20 ? 'Baixo' : 'Normal';

                return (
                  <Grid size={12} key={lote.id}>
                    <Card variant="outlined" sx={{ borderColor: '#E3E8EF', borderRadius: 3 }}>
                      <CardContent sx={{ pb: '16px !important' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {lote.lote || 'Sem código de lote'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.76rem', color: '#9CA3AF', mb: 1 }}>
                              NF {lote.nf_numero || '—'} / Série {lote.nf_serie || '—'}
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              <Chip label={`Compra: ${formatDate(lote.data_compra)}`} size="small" />
                              <Chip label={`Qtd: ${lote.quantidade}`} size="small" />
                              <Chip label={`Disponível: ${lote.disponivel}`} size="small" />
                              <Chip label={lote.local_armazenamento || 'Sem local'} size="small" />
                              <StatusChip label={label} status={status} />
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Editar lote">
                              <IconButton size="small" onClick={() => openEditarLote(lote)} sx={{ color: '#5A6A7E' }}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir lote">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setLoteDeleteTarget(lote);
                                  setLoteDeleteOpen(true);
                                }}
                                sx={{ color: '#E53935' }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}

              {!epiLotes.length && (
                <Grid size={12}>
                  <Card variant="outlined" sx={{ borderColor: '#E3E8EF', borderRadius: 3 }}>
                    <CardContent>
                      <Typography sx={{ color: '#5A6A7E' }}>
                        Nenhum lote cadastrado para este EPI.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      </Drawer>

      <Dialog open={loteFormOpen} onClose={() => setLoteFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {loteEditId ? 'Editar Lote' : 'Novo Lote'}
          <IconButton onClick={() => setLoteFormOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="EPI"
                value={selectedEpi?.nome || ''}
                size="small"
                disabled
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Código do Lote"
                value={loteForm.lote}
                onChange={(e) => setLoteForm({ ...loteForm, lote: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Data da Compra"
                type="date"
                value={loteForm.data_compra}
                onChange={(e) => setLoteForm({ ...loteForm, data_compra: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Nº NF"
                value={loteForm.nf_numero}
                onChange={(e) => setLoteForm({ ...loteForm, nf_numero: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Série NF"
                value={loteForm.nf_serie}
                onChange={(e) => setLoteForm({ ...loteForm, nf_serie: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Quantidade"
                type="number"
                value={loteForm.quantidade}
                onChange={(e) => setLoteForm({ ...loteForm, quantidade: Number(e.target.value) })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="CNPJ Fornecedor"
                value={loteForm.fornecedor_cnpj}
                onChange={(e) => setLoteForm({ ...loteForm, fornecedor_cnpj: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Local de Armazenamento"
                value={loteForm.local_armazenamento}
                onChange={(e) => setLoteForm({ ...loteForm, local_armazenamento: e.target.value })}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setLoteFormOpen(false)} sx={{ borderColor: '#E3E8EF', color: '#5A6A7E' }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvarLote}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={loteDeleteOpen}
        title="Excluir Lote"
        message={`Deseja excluir o lote "${loteDeleteTarget?.lote}"?`}
        confirmLabel="Excluir"
        onConfirm={confirmarExclusaoLote}
        onCancel={() => setLoteDeleteOpen(false)}
        destructive
      />
    </Box>
  );
};

export default EPIsPage;