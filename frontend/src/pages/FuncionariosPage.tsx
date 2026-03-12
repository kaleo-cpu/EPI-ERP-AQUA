import { useEffect, useMemo, useState } from 'react';
import { useNotificacao } from '../components/NotificacaoProvider';
import { useAuth } from '../contexts/AuthContext';
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
import { PersonAdd, Visibility, Close, Edit, Delete } from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import SearchToolbar from '../components/SearchToolbar';
import TableCard from '../components/TableCard';
import StatusChip from '../components/StatusChip';
import UserAvatarCircle from '../components/UserAvatarCircle';
import {
  listarFuncionarios,
  criarFuncionario,
  editarFuncionario,
  excluirFuncionarioComSenha,
  listarEntregasRelatorio,
  type Funcionario,
  type FuncionarioInput,
  type EntregaRelatorio,
} from '../services/api';

const statusMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  ativo: 'success',
  inativo: 'error',
};

const emptyForm: FuncionarioInput = {
  nome: '',
  cpf: '',
  data_nascimento: null,
  nome_pai: '',
  nome_mae: '',
  endereco: '',
  telefone: '',
  email: '',
  cbo: '',
  funcao: '',
  setor: '',
  data_admissao: '',
  pis: '',
  ctps_numero: '',
  ctps_serie: '',
  status: 'ativo',
  biometria_template_hash: '',
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  if (value.includes('T')) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  }
  const [y, m, d] = value.split('-');
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
};

const toStatusLabel = (status: string) => (status === 'ativo' ? 'Ativo' : 'Inativo');

const FuncionariosPage = () => {
  const { sucesso, erro } = useNotificacao();
  const { user } = useAuth();

  console.log('USER LOGADO:', user);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FuncionarioInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [epiDialogOpen, setEpiDialogOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [historico, setHistorico] = useState<EntregaRelatorio[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Funcionario | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isAdmin = true;

  const carregarFuncionarios = async () => {
    try {
      setLoading(true);
      const data = await listarFuncionarios();
      setFuncionarios(data);
    } catch (e: any) {
      erro(e?.message || 'Falha ao carregar funcionários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return [...funcionarios]
      .filter((f) =>
        f.nome.toLowerCase().includes(term) ||
        f.cpf.toLowerCase().includes(term) ||
        f.setor.toLowerCase().includes(term) ||
        f.funcao.toLowerCase().includes(term)
      )
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [search, funcionarios]);

  const openNovo = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditar = (item: Funcionario) => {
    setForm({
      nome: item.nome || '',
      cpf: item.cpf || '',
      data_nascimento: item.data_nascimento || null,
      nome_pai: item.nome_pai || '',
      nome_mae: item.nome_mae || '',
      endereco: item.endereco || '',
      telefone: item.telefone || '',
      email: item.email || '',
      cbo: item.cbo || '',
      funcao: item.funcao || '',
      setor: item.setor || '',
      data_admissao: item.data_admissao || '',
      pis: item.pis || '',
      ctps_numero: item.ctps_numero || '',
      ctps_serie: item.ctps_serie || '',
      status: item.status || 'ativo',
      biometria_template_hash: item.biometria_template_hash || '',
    });
    setEditingId(item.id);
    setFormOpen(true);
  };

  const salvar = async () => {
    try {
      const payload: FuncionarioInput = {
        ...form,
        data_nascimento: form.data_nascimento || null,
      };

      if (editingId) {
        await editarFuncionario(editingId, payload);
        sucesso('Funcionário atualizado com sucesso.');
      } else {
        await criarFuncionario(payload);
        sucesso('Funcionário cadastrado com sucesso.');
      }

      setFormOpen(false);
      await carregarFuncionarios();
    } catch (e: any) {
      erro(e?.message || 'Não foi possível salvar o funcionário.');
    }
  };

  const handleOpenEpis = async (func: Funcionario) => {
    setSelectedFuncionario(func);
    setEpiDialogOpen(true);

    try {
      setLoadingHistorico(true);
      const data = await listarEntregasRelatorio({ funcionario_id: func.id });
      setHistorico(data);
    } catch (e: any) {
      erro(e?.message || 'Não foi possível carregar o histórico de entregas.');
      setHistorico([]);
    } finally {
      setLoadingHistorico(false);
    }
  };

  const handleOpenDelete = (func: Funcionario) => {
    setDeleteTarget(func);
    setAdminPassword('');
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (!adminPassword) {
      erro('Digite a senha do administrador.');
      return;
    }

    try {
      setDeleting(true);
      const resp = await excluirFuncionarioComSenha(deleteTarget.id, adminPassword);
      sucesso(resp.detail || 'Funcionário excluído com sucesso.');
      setDeleteOpen(false);
      setDeleteTarget(null);
      setAdminPassword('');
      await carregarFuncionarios();
    } catch (e: any) {
      erro(e?.message || 'Não foi possível excluir o funcionário.');
    } finally {
      setDeleting(false);
    }
  };

  const getEntregaStatus = (validade: string) => {
    const hoje = new Date();
    const venc = new Date(validade);
    if (isNaN(venc.getTime())) return { label: 'Ativo', status: 'success' as const };

    const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: 'Vencido', status: 'error' as const };
    if (diff <= 30) return { label: 'Próx. Vencimento', status: 'warning' as const };
    return { label: 'Válido', status: 'success' as const };
  };

  return (
    <Box>
      <PageHeader
        title="Funcionários"
        subtitle="Cadastro e gestão dos colaboradores"
        action={
          <Button variant="contained" startIcon={<PersonAdd />} onClick={openNovo}>
            Novo Funcionário
          </Button>
        }
      />

      <SearchToolbar
        placeholder="Buscar por nome, CPF, setor ou função..."
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
              label: 'Nome',
              render: (val: string, row: Funcionario) => <UserAvatarCircle name={val} subtitle={row.funcao} />,
            },
            { key: 'cpf', label: 'CPF' },
            { key: 'setor', label: 'Setor' },
            { key: 'cbo', label: 'CBO' },
            {
              key: 'data_admissao',
              label: 'Admissão',
              render: (val: string) => formatDate(val),
            },
            {
              key: 'status',
              label: 'Status',
              render: (val: string) => (
                <StatusChip label={toStatusLabel(val)} status={statusMap[val] || 'default'} />
              ),
            },
            {
              key: 'id',
              label: 'Ações',
              render: (_: any, row: Funcionario) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Ver EPIs entregues">
                    <IconButton size="small" onClick={() => handleOpenEpis(row)} sx={{ color: '#0B5ED7' }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => openEditar(row)} sx={{ color: '#5A6A7E' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {isAdmin && (
                    <Tooltip title="Excluir funcionário">
                      <IconButton size="small" onClick={() => handleOpenDelete(row)} sx={{ color: '#E53935' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ),
            },
          ]}
          rows={filtered}
        />
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
          <IconButton onClick={() => setFormOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Nome Completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Data de Nascimento" type="date" value={form.data_nascimento || ''} onChange={(e) => setForm({ ...form, data_nascimento: e.target.value || null })} size="small" InputLabelProps={{ shrink: true }} />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Setor" value={form.setor} onChange={(e) => setForm({ ...form, setor: e.target.value })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Função" value={form.funcao} onChange={(e) => setForm({ ...form, funcao: e.target.value })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="CBO" value={form.cbo} onChange={(e) => setForm({ ...form, cbo: e.target.value })} size="small" />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Data de Admissão" type="date" value={form.data_admissao} onChange={(e) => setForm({ ...form, data_admissao: e.target.value })} size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'ativo' | 'inativo' })} size="small">
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Telefone" value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="E-mail" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} size="small" />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Nome do Pai" value={form.nome_pai || ''} onChange={(e) => setForm({ ...form, nome_pai: e.target.value })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Nome da Mãe" value={form.nome_mae || ''} onChange={(e) => setForm({ ...form, nome_mae: e.target.value })} size="small" />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="PIS" value={form.pis || ''} onChange={(e) => setForm({ ...form, pis: e.target.value })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="CTPS Número" value={form.ctps_numero || ''} onChange={(e) => setForm({ ...form, ctps_numero: e.target.value })} size="small" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="CTPS Série" value={form.ctps_serie || ''} onChange={(e) => setForm({ ...form, ctps_serie: e.target.value })} size="small" />
            </Grid>

            <Grid size={12}>
              <TextField fullWidth label="Endereço" value={form.endereco || ''} onChange={(e) => setForm({ ...form, endereco: e.target.value })} size="small" multiline minRows={2} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setFormOpen(false)} sx={{ borderColor: '#E3E8EF', color: '#5A6A7E' }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvar}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={epiDialogOpen} onClose={() => setEpiDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          EPIs entregues — {selectedFuncionario?.nome}
          <IconButton onClick={() => setEpiDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {loadingHistorico ? (
            <LinearProgress />
          ) : historico.length === 0 ? (
            <Typography variant="body2" sx={{ py: 3, textAlign: 'center' }}>
              Nenhuma entrega registrada para este funcionário.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>EPI</TableCell>
                    <TableCell>Lote</TableCell>
                    <TableCell>Entrega</TableCell>
                    <TableCell>Validade</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historico.map((item) => {
                    const status = getEntregaStatus(item.validade_ate);
                    return (
                      <TableRow key={item.id}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{item.epi_nome}</TableCell>
                        <TableCell>{item.lote || '—'}</TableCell>
                        <TableCell>{formatDate(item.data_entrega)}</TableCell>
                        <TableCell>{formatDate(item.validade_ate)}</TableCell>
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
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Excluir Funcionário
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 2, fontSize: '0.9rem' }}>
            Para excluir <b>{deleteTarget?.nome}</b>, confirme com a senha do administrador.
          </Typography>

          <TextField
            fullWidth
            label="Senha do administrador"
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            size="small"
          />

          <Typography sx={{ mt: 1.5, fontSize: '0.75rem', color: '#9CA3AF' }}>
            Funcionários com histórico de entregas não poderão ser excluídos.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteOpen(false)}
            sx={{ borderColor: '#E3E8EF', color: '#5A6A7E' }}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FuncionariosPage;