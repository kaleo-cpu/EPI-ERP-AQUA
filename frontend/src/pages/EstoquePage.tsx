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
  LinearProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Add, Edit, Delete, Close, Inventory2 } from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import TableCard from '../components/TableCard';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  listarLotes,
  listarEPIs,
  criarLote,
  editarLote,
  excluirLote,
  type Lote,
  type LoteInput,
  type EPI,
} from '../services/api';

const makeEmptyLote = (): LoteInput => ({
  epi: 0,
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

const EstoquePage = () => {
  const { sucesso, erro } = useNotificacao();

  const [loading, setLoading] = useState(true);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [epis, setEpis] = useState<EPI[]>([]);

  const [search, setSearch] = useState('');
  const [filterEpi, setFilterEpi] = useState('');
  const [filterLocal, setFilterLocal] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<LoteInput>(makeEmptyLote());
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lote | null>(null);

  const carregarTudo = async () => {
    try {
      setLoading(true);
      const [lotesResp, episResp] = await Promise.all([listarLotes(), listarEPIs()]);
      setLotes(lotesResp);
      setEpis(episResp);
    } catch (e: any) {
      erro(e?.message || 'Falha ao carregar estoque.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  const locais = useMemo(() => {
    return [...new Set(lotes.map((item) => item.local_armazenamento).filter(Boolean))];
  }, [lotes]);

  const epiNomeMap = useMemo(() => {
    const map = new Map<number, string>();
    epis.forEach((epi) => map.set(epi.id, epi.nome));
    return map;
  }, [epis]);

  const filtered = useMemo(() => {
    return lotes.filter((item) => {
      const t = search.toLowerCase().trim();

      const nomeEpi = epiNomeMap.get(item.epi)?.toLowerCase() || '';

      const matchSearch =
        !t ||
        item.lote.toLowerCase().includes(t) ||
        nomeEpi.includes(t) ||
        item.fornecedor_cnpj.toLowerCase().includes(t) ||
        item.nf_numero.toLowerCase().includes(t);

      const matchEpi = !filterEpi || Number(item.epi) === Number(filterEpi);
      const matchLocal = !filterLocal || item.local_armazenamento === filterLocal;

      return matchSearch && matchEpi && matchLocal;
    });
  }, [lotes, search, filterEpi, filterLocal, epiNomeMap]);

  const openNovoLote = () => {
    setForm(makeEmptyLote());
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditarLote = (item: Lote) => {
    setForm({
      epi: item.epi,
      lote: item.lote,
      nf_numero: item.nf_numero,
      nf_serie: item.nf_serie,
      fornecedor_cnpj: item.fornecedor_cnpj,
      data_compra: item.data_compra,
      quantidade: item.quantidade,
      local_armazenamento: item.local_armazenamento,
    });
    setEditingId(item.id);
    setFormOpen(true);
  };

  const salvarLote = async () => {
    try {
      const payload: LoteInput = {
        ...form,
        epi: Number(form.epi),
        quantidade: Number(form.quantidade || 0),
      };

      if (editingId) {
        await editarLote(editingId, payload);
        sucesso('Lote atualizado com sucesso.');
      } else {
        await criarLote(payload);
        sucesso('Lote cadastrado com sucesso.');
      }

      setFormOpen(false);
      await carregarTudo();
    } catch (e: any) {
      erro(e?.message || 'Não foi possível salvar o lote.');
    }
  };

  const confirmarExclusao = async () => {
    if (!deleteTarget) return;

    try {
      await excluirLote(deleteTarget.id);
      sucesso('Lote excluído com sucesso.');
      setDeleteOpen(false);
      setDeleteTarget(null);
      await carregarTudo();
    } catch (e: any) {
      erro(e?.message || 'Não foi possível excluir o lote.');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Estoque / Lotes"
        subtitle="Controle de lotes e movimentações de estoque"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={openNovoLote}>
            Novo Lote
          </Button>
        }
      />

      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Buscar por lote, EPI, NF ou fornecedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 240 }}
        />

        <TextField
          size="small"
          select
          label="Filtrar por EPI"
          value={filterEpi}
          onChange={(e) => setFilterEpi(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todos os EPIs</MenuItem>
          {epis.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.nome}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          select
          label="Local"
          value={filterLocal}
          onChange={(e) => setFilterLocal(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todos os Locais</MenuItem>
          {locais.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
      </Box>

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
              key: 'lote',
              label: 'Lote',
              render: (val: string, row: Lote) => (
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{val || '—'}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                    NF {row.nf_numero || '—'} / Série {row.nf_serie || '—'}
                  </Typography>
                </Box>
              ),
            },
            {
              key: 'epi',
              label: 'EPI',
              render: (val: number) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Inventory2 sx={{ fontSize: 16, color: '#0B5ED7' }} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {epiNomeMap.get(val) || `EPI #${val}`}
                  </Typography>
                </Box>
              ),
            },
            {
              key: 'data_compra',
              label: 'Data Compra',
              render: (val: string) => formatDate(val),
            },
            { key: 'fornecedor_cnpj', label: 'CNPJ Fornecedor' },
            { key: 'local_armazenamento', label: 'Local' },
            {
              key: 'disponivel',
              label: 'Disponível',
              render: (val: number, row: Lote) => {
                const pct = row.quantidade > 0 ? (Number(val || 0) / Number(row.quantidade || 0)) * 100 : 0;
                const status = pct === 0 ? 'error' : pct <= 20 ? 'warning' : 'success';
                const statusLabel = pct === 0 ? 'Esgotado' : pct <= 20 ? 'Baixo' : 'Normal';

                return (
                  <Box sx={{ minWidth: 120 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {val}/{row.quantidade}
                      </Typography>
                      <StatusChip label={statusLabel} status={status} />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 5,
                        borderRadius: 3,
                        bgcolor: '#F4F6F9',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                );
              },
            },
            {
              key: 'id',
              label: 'Ações',
              render: (_: any, row: Lote) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => openEditarLote(row)} sx={{ color: '#5A6A7E' }}>
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
          {editingId ? 'Editar Lote' : 'Novo Lote'}
          <IconButton onClick={() => setFormOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="EPI"
                value={form.epi || ''}
                onChange={(e) => setForm({ ...form, epi: Number(e.target.value) })}
                size="small"
              >
                {epis.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.nome}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Código do Lote"
                value={form.lote}
                onChange={(e) => setForm({ ...form, lote: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Data da Compra"
                type="date"
                value={form.data_compra}
                onChange={(e) => setForm({ ...form, data_compra: e.target.value })}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Nº NF"
                value={form.nf_numero}
                onChange={(e) => setForm({ ...form, nf_numero: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Série NF"
                value={form.nf_serie}
                onChange={(e) => setForm({ ...form, nf_serie: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Quantidade"
                type="number"
                value={form.quantidade}
                onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="CNPJ Fornecedor"
                value={form.fornecedor_cnpj}
                onChange={(e) => setForm({ ...form, fornecedor_cnpj: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Local de Armazenamento"
                value={form.local_armazenamento}
                onChange={(e) => setForm({ ...form, local_armazenamento: e.target.value })}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setFormOpen(false)} sx={{ borderColor: '#E3E8EF', color: '#5A6A7E' }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvarLote}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        title="Excluir Lote"
        message={`Deseja excluir o lote "${deleteTarget?.lote}"?`}
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onCancel={() => setDeleteOpen(false)}
        destructive
      />
    </Box>
  );
};

export default EstoquePage;