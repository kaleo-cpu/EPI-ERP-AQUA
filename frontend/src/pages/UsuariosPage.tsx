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
  Typography,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
  Alert,
} from '@mui/material';
import { PersonAdd, Close, Edit } from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import SearchToolbar from '../components/SearchToolbar';
import TableCard from '../components/TableCard';
import StatusChip from '../components/StatusChip';
import UserAvatarCircle from '../components/UserAvatarCircle';
import {
  listarUsuarios,
  criarUsuario,
  editarUsuario,
  type Usuario,
  type UsuarioInput,
} from '../services/api';

const perfilLabelMap: Record<string, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
};

const perfilStatusMap: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  admin: 'info',
  gestor: 'warning',
  colaborador: 'success',
};

const emptyForm: UsuarioInput & { confirmarSenha: string } = {
  nome: '',
  email: '',
  perfil: 'colaborador',
  senha: '',
  confirmarSenha: '',
};

const UsuariosPage = () => {
  const { sucesso, erro, alerta } = useNotificacao();

  const [loading, setLoading] = useState(true);
  const [semPermissao, setSemPermissao] = useState(false);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await listarUsuarios();
      setUsuarios(data);
      setSemPermissao(false);
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (
        msg.includes('You do not have permission') ||
        msg.includes('permission') ||
        msg.includes('403') ||
        msg.includes('not have permission')
      ) {
        setSemPermissao(true);
        setUsuarios([]);
        alerta('Seu usuário não possui permissão de administrador para gerenciar usuários.');
      } else {
        erro(msg || 'Falha ao carregar usuários.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return usuarios;

    return usuarios.filter((u) => {
      const perfil = perfilLabelMap[u.perfil]?.toLowerCase() || u.perfil.toLowerCase();
      return (
        u.nome.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.username || '').toLowerCase().includes(term) ||
        perfil.includes(term)
      );
    });
  }, [usuarios, search]);

  const openNovo = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditar = (user: Usuario) => {
    setForm({
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
      senha: '',
      confirmarSenha: '',
    });
    setEditingId(user.id);
    setFormOpen(true);
  };

  const salvar = async () => {
    try {
      if (!form.nome.trim() || !form.email.trim() || !form.perfil) {
        erro('Preencha nome, e-mail e perfil.');
        return;
      }

      if (!editingId && !form.senha?.trim()) {
        erro('Informe a senha do novo usuário.');
        return;
      }

      if (form.senha && form.senha !== form.confirmarSenha) {
        erro('A confirmação de senha não confere.');
        return;
      }

      const payload: UsuarioInput = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        perfil: form.perfil,
        ...(form.senha ? { senha: form.senha } : {}),
      };

      if (editingId) {
        await editarUsuario(editingId, payload);
        sucesso('Usuário atualizado com sucesso.');
      } else {
        await criarUsuario(payload);
        sucesso('Usuário criado com sucesso.');
      }

      setFormOpen(false);
      await carregarUsuarios();
    } catch (e: any) {
      erro(e?.message || 'Não foi possível salvar o usuário.');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Usuários"
        subtitle="Gerenciamento de acessos ao sistema"
        action={
          !semPermissao ? (
            <Button variant="contained" startIcon={<PersonAdd />} onClick={openNovo}>
              Novo Usuário
            </Button>
          ) : undefined
        }
      />

      {semPermissao && (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
          Esta área exige permissão de administrador no backend.
        </Alert>
      )}

      <SearchToolbar
        placeholder="Buscar por nome, e-mail, usuário ou perfil..."
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
              label: 'Usuário',
              render: (val: string, row: Usuario) => (
                <UserAvatarCircle
                  name={val}
                  subtitle={`${row.email}${row.username ? ` • @${row.username}` : ''}`}
                />
              ),
            },
            {
              key: 'perfil',
              label: 'Perfil',
              render: (val: string) => (
                <StatusChip
                  label={perfilLabelMap[val] || val}
                  status={perfilStatusMap[val] || 'default'}
                />
              ),
            },
            {
              key: 'username',
              label: 'Login',
              render: (val: string) => (
                <Typography sx={{ fontSize: '0.8rem', color: '#5A6A7E' }}>
                  {val || '—'}
                </Typography>
              ),
            },
            {
              key: 'email',
              label: 'E-mail',
              render: (val: string) => (
                <Typography sx={{ fontSize: '0.82rem' }}>{val || '—'}</Typography>
              ),
            },
            {
              key: 'id',
              label: 'Ações',
              render: (_: any, row: Usuario) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Editar">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => openEditar(row)}
                        sx={{ color: '#5A6A7E' }}
                        disabled={semPermissao}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              ),
            },
          ]}
          rows={filtered}
        />
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {editingId ? 'Editar Usuário' : 'Novo Usuário'}
          <IconButton onClick={() => setFormOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                select
                label="Perfil"
                value={form.perfil}
                onChange={(e) => setForm({ ...form, perfil: e.target.value })}
                size="small"
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="gestor">Gestor</MenuItem>
                <MenuItem value="colaborador">Colaborador</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={editingId ? 'Nova Senha (opcional)' : 'Senha'}
                type="password"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Confirmar Senha"
                type="password"
                value={form.confirmarSenha}
                onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
                size="small"
              />
            </Grid>

            {editingId && (
              <Grid size={12}>
                <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                  O username é gerado no backend e não precisa ser informado aqui.
                </Typography>
              </Grid>
            )}
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
          <Button variant="contained" onClick={salvar}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsuariosPage;