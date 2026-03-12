import { useEffect, useMemo, useState } from 'react';
import { useNotificacao } from '../components/NotificacaoProvider';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add,
  People,
  Edit,
  Delete,
  Close,
  Business,
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import SearchToolbar from '../components/SearchToolbar';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';
import { listarFuncionarios, type Funcionario } from '../services/api';

type SetorMeta = {
  nome: string;
  descricao: string;
  responsavel: string;
  status: 'Ativo' | 'Inativo';
};

const STORAGE_KEY = 'erp-epi-setores-meta';

const emptyForm: SetorMeta = {
  nome: '',
  descricao: '',
  responsavel: '',
  status: 'Ativo',
};

const loadMeta = (): Record<string, SetorMeta> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveMeta = (meta: Record<string, SetorMeta>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
};

const SetoresPage = () => {
  const { sucesso, erro } = useNotificacao();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [metaMap, setMetaMap] = useState<Record<string, SetorMeta>>({});

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<SetorMeta>(emptyForm);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SetorMeta | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const data = await listarFuncionarios();
        setFuncionarios(data);
        setMetaMap(loadMeta());
      } catch (e: any) {
        erro(e?.message || 'Falha ao carregar setores.');
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  const setores = useMemo(() => {
    const nomesReais = [...new Set(funcionarios.map((f) => f.setor).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );

    return nomesReais.map((nome) => {
      const meta = metaMap[nome];
      const funcionariosNoSetor = funcionarios.filter((f) => f.setor === nome).length;

      return {
        id: nome,
        nome,
        descricao: meta?.descricao || 'Setor identificado a partir dos funcionários cadastrados.',
        responsavel: meta?.responsavel || 'Não informado',
        status: meta?.status || 'Ativo',
        funcionarios: funcionariosNoSetor,
      };
    });
  }, [funcionarios, metaMap]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return setores;

    return setores.filter((s) => s.nome.toLowerCase().includes(term));
  }, [setores, search]);

  const handleEdit = (setor: any) => {
    setForm({
      nome: setor.nome,
      descricao: setor.descricao,
      responsavel: setor.responsavel === 'Não informado' ? '' : setor.responsavel,
      status: setor.status,
    });
    setEditingKey(setor.nome);
    setFormOpen(true);
  };

  const handleDelete = (setor: any) => {
    setDeleteTarget({
      nome: setor.nome,
      descricao: setor.descricao,
      responsavel: setor.responsavel,
      status: setor.status,
    });
    setDeleteOpen(true);
  };

  const handleSalvar = () => {
    const nomeBase = (editingKey || form.nome).trim();

    if (!nomeBase) {
      erro('Informe o nome do setor.');
      return;
    }

    const next = {
      ...metaMap,
      [nomeBase]: {
        nome: nomeBase,
        descricao: form.descricao,
        responsavel: form.responsavel,
        status: form.status,
      },
    };

    setMetaMap(next);
    saveMeta(next);
    setFormOpen(false);
    sucesso('Setor salvo com sucesso.');
  };

  const handleExcluir = () => {
    if (!deleteTarget) return;

    const next = { ...metaMap };
    delete next[deleteTarget.nome];
    setMetaMap(next);
    saveMeta(next);
    setDeleteOpen(false);
    setDeleteTarget(null);
    sucesso('Configuração do setor removida.');
  };

  const sectorColors = ['#0B5ED7', '#2E7D32', '#F57F17', '#071A2B', '#C62828', '#6A1B9A', '#00838F'];

  return (
    <Box>
      <PageHeader
        title="Setores"
        subtitle="Departamentos e áreas da empresa"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setForm(emptyForm);
              setEditingKey(null);
              setFormOpen(true);
            }}
          >
            Novo Setor
          </Button>
        }
      />

      <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
        Esta página usa os setores reais encontrados nos funcionários cadastrados. Como o backend ainda não possui módulo próprio de setores, descrição, responsável e status ficam salvos localmente neste navegador.
      </Alert>

      <SearchToolbar placeholder="Buscar setor..." value={search} onChange={setSearch} />

      {loading ? (
        <Card>
          <CardContent>
            <Typography variant="body2">Carregando setores...</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((setor, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={setor.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                  borderTop: `3px solid ${sectorColors[idx % sectorColors.length]}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business sx={{ color: sectorColors[idx % sectorColors.length], fontSize: 22 }} />
                      <Typography variant="h5">{setor.nome}</Typography>
                    </Box>
                    <StatusChip label={setor.status} status={setor.status === 'Ativo' ? 'success' : 'error'} />
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2, minHeight: 36, lineHeight: 1.5 }}>
                    {setor.descricao}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#5A6A7E', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Responsável:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0E1B2A' }}>
                      {setor.responsavel}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 2,
                      pt: 1.5,
                      borderTop: '1px solid #E3E8EF',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <People sx={{ fontSize: 18, color: '#5A6A7E' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {setor.funcionarios} funcionário(s)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEdit(setor)} sx={{ color: '#5A6A7E' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir configuração">
                        <IconButton size="small" onClick={() => handleDelete(setor)} sx={{ color: '#E53935' }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {!filtered.length && (
            <Grid size={12}>
              <Card>
                <CardContent>
                  <Typography variant="body2" sx={{ color: '#5A6A7E' }}>
                    Nenhum setor encontrado.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingKey ? 'Editar Setor' : 'Novo Setor'}
          <IconButton onClick={() => setFormOpen(false)}><Close /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Nome do Setor"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                size="small"
                disabled={!!editingKey}
                helperText={editingKey ? 'O nome vem dos dados reais dos funcionários.' : 'Para um novo setor aparecer na listagem, também precisa existir em funcionários.'}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                size="small"
                multiline
                rows={2}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Responsável"
                value={form.responsavel}
                onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'Ativo' | 'Inativo' })}
                size="small"
              >
                <MenuItem value="Ativo">Ativo</MenuItem>
                <MenuItem value="Inativo">Inativo</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setFormOpen(false)}
            sx={{ borderColor: '#E3E8EF', color: '#5A6A7E' }}
          >
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSalvar}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        title="Excluir Setor"
        message={`Tem certeza que deseja excluir a configuração do setor "${deleteTarget?.nome}"? Os funcionários continuarão existindo normalmente.`}
        confirmLabel="Excluir"
        onConfirm={handleExcluir}
        onCancel={() => setDeleteOpen(false)}
        destructive
      />
    </Box>
  );
};

export default SetoresPage;