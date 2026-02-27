import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Grid,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Stack,
  LinearProgress,
  Tooltip
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'

/**
 * Mantive 100% das funções (mesmos endpoints e payloads).
 * Alterações: estética + filtro/busca de funcionários.
 */

// Paleta Aqua Slides (Azul + Amarelo)
const AQUA = {
  navy: '#071A2B',
  deep: '#0A2E4E',
  blue: '#0B5ED7',
  blue2: '#0A4CB8',
  yellow: '#FFC400',
  yellow2: '#FFB300',
  ink: '#0E1B2A',
}

export default function Funcionarios() {
  const [items, setItems] = useState([])
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [funcao, setFuncao] = useState('')
  const [setor, setSetor] = useState('')
  const [cbo, setCbo] = useState('')
  const [data, setData] = useState('')
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' })

  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)

  // NOVO: filtro/busca
  const [busca, setBusca] = useState('')

  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/funcionarios/')
      setItems(res.data)
    } finally {
      setLoading(false)
    }
  }

  // IMPORTANTE: não passe Promise direto no useEffect
  useEffect(() => { load() }, [])

  const add = async () => {
    try {
      await api.post('/funcionarios/', {
        nome, cpf, funcao, setor, cbo, data_admissao: data
      })
      setSnack({ open: true, msg: 'Funcionário cadastrado.', sev: 'success' })
      setNome(''); setCpf(''); setFuncao(''); setSetor(''); setCbo(''); setData('')
      load()
    } catch (e) {
      setSnack({ open: true, msg: 'Falha ao cadastrar funcionário', sev: 'error' })
    }
  }

  const openEdit = (item) => { setEditItem({ ...item }); setEditOpen(true) }
  const saveEdit = async () => {
    try {
      const id = editItem.id
      const payload = {
        nome: editItem.nome,
        cpf: editItem.cpf,
        funcao: editItem.funcao,
        setor: editItem.setor,
        cbo: editItem.cbo,
        data_admissao: editItem.data_admissao
      }
      await api.put(`/funcionarios/${id}/`, payload)
      setSnack({ open: true, msg: 'Funcionário atualizado.', sev: 'success' })
      setEditOpen(false); setEditItem(null)
      load()
    } catch (e) {
      setSnack({ open: true, msg: 'Falha ao atualizar funcionário', sev: 'error' })
    }
  }

  const openDelete = (item) => { setDeleteItem(item); setDeleteOpen(true) }
  const confirmDelete = async () => {
    try {
      await api.delete(`/funcionarios/${deleteItem.id}/`)
      setSnack({ open: true, msg: 'Funcionário excluído.', sev: 'success' })
      setDeleteOpen(false); setDeleteItem(null)
      load()
    } catch (e) {
      setSnack({ open: true, msg: 'Não foi possível excluir (existem entregas vinculadas?).', sev: 'error' })
    }
  }

  const itemsFiltrados = useMemo(() => {
    const q = (busca || '').trim().toLowerCase()
    if (!q) return items
    return items.filter(i => {
      const nome_ = String(i.nome || '').toLowerCase()
      const cpf_ = String(i.cpf || '').toLowerCase()
      const funcao_ = String(i.funcao || '').toLowerCase()
      const setor_ = String(i.setor || '').toLowerCase()
      const cbo_ = String(i.cbo || '').toLowerCase()
      return (
        nome_.includes(q) ||
        cpf_.includes(q) ||
        funcao_.includes(q) ||
        setor_.includes(q) ||
        cbo_.includes(q)
      )
    })
  }, [items, busca])

  return (
    <Box
      sx={{
        minHeight: '100%',
        pb: 6,
        background: `
          radial-gradient(1100px 360px at 10% 0%, ${AQUA.yellow}12, transparent 55%),
          radial-gradient(900px 360px at 90% 10%, ${AQUA.blue}14, transparent 58%),
          linear-gradient(180deg, rgba(7,26,43,0.03) 0%, rgba(7,26,43,0.00) 40%, rgba(7,26,43,0.02) 100%)
        `
      }}
    >
      <Container sx={{ mt: 3 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid rgba(7,26,43,0.08)',
            background: `
              radial-gradient(900px 240px at 12% 20%, ${AQUA.yellow}18, transparent 60%),
              radial-gradient(900px 240px at 88% 15%, ${AQUA.blue}18, transparent 60%),
              linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.88) 100%)
            `,
            position: 'relative',
            overflow: 'hidden',
            mb: 2
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: 5,
              width: '100%',
              background: `linear-gradient(90deg, ${AQUA.yellow} 0%, ${AQUA.blue} 55%, rgba(11,94,215,0) 100%)`,
              opacity: 0.95
            }}
          />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={2}
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 950, letterSpacing: -0.6, color: AQUA.ink, lineHeight: 1.05 }}
              >
                Funcionários
              </Typography>
              <Typography sx={{ mt: 0.6, color: 'text.secondary', fontWeight: 600 }}>
                Cadastro, edição e exclusão • com filtro rápido de busca
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1.4, flexWrap: 'wrap', rowGap: 1 }}>
                <Chip
                  size="small"
                  label="Aqua Slides"
                  sx={{ fontWeight: 900, bgcolor: `${AQUA.blue}12`, color: AQUA.blue, border: `1px solid ${AQUA.blue}22`, borderRadius: 2 }}
                />
                <Chip
                  size="small"
                  label={`${itemsFiltrados.length} exibidos`}
                  sx={{ fontWeight: 900, bgcolor: `${AQUA.yellow}18`, color: '#8A5A00', border: `1px solid ${AQUA.yellow}35`, borderRadius: 2 }}
                />
              </Stack>
            </Box>

            {/* NOVO: Campo de busca */}
            <TextField
              label="Buscar funcionário (nome, CPF, função, setor, CBO)"
              size="small"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'text.secondary' }}>
                    <SearchOutlinedIcon fontSize="small" />
                  </Box>
                )
              }}
              sx={{
                minWidth: { xs: '100%', md: 420 },
                '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(7,26,43,0.02)' },
                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: AQUA.blue },
                '& .MuiInputLabel-root.Mui-focused': { color: AQUA.blue },
              }}
            />
          </Stack>

          {loading ? <LinearProgress sx={{ mt: 2, borderRadius: 2 }} /> : null}
        </Paper>

        {/* Cadastro */}
        <Paper
          elevation={0}
          sx={{
            p: 2.2,
            mb: 2,
            borderRadius: 2,
            border: '1px solid rgba(7,26,43,0.08)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)'
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <PersonAddAltOutlinedIcon sx={{ color: AQUA.blue }} />
            <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
              Cadastrar funcionário
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Nome"
                fullWidth
                value={nome}
                onChange={e => setNome(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="CPF"
                fullWidth
                value={cpf}
                onChange={e => setCpf(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                label="CBO"
                fullWidth
                value={cbo}
                onChange={e => setCbo(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Admissão"
                type="date"
                fullWidth
                value={data}
                onChange={e => setData(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Função"
                fullWidth
                value={funcao}
                onChange={e => setFuncao(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Setor"
                fullWidth
                value={setor}
                onChange={e => setSetor(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={add}
                startIcon={<SaveOutlinedIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 900,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${AQUA.blue} 0%, ${AQUA.blue2} 60%, ${AQUA.blue} 100%)`,
                  boxShadow: '0 10px 22px rgba(11,94,215,0.20)'
                }}
              >
                Adicionar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Lista */}
        <Paper
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: 2,
            border: '1px solid rgba(7,26,43,0.08)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)'
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BadgeOutlinedIcon sx={{ color: AQUA.yellow2 }} />
              <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
                Funcionários cadastrados
              </Typography>
            </Stack>

            <Chip
              size="small"
              label={`${itemsFiltrados.length} itens`}
              sx={{ borderRadius: 2, fontWeight: 900, bgcolor: `${AQUA.blue}10`, color: AQUA.blue, border: `1px solid ${AQUA.blue}20` }}
            />
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          <Grid container spacing={1}>
            {itemsFiltrados.map(i => (
              <Grid key={i.id} item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.6,
                    borderRadius: 2,
                    border: '1px solid rgba(7,26,43,0.08)',
                    bgcolor: 'rgba(255,255,255,0.92)'
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.2}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                  >
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={1}>
                        <Typography sx={{ fontWeight: 900, color: AQUA.ink }}>
                          {i.nome}
                        </Typography>
                        <Chip
                          size="small"
                          label={i.cpf || 'CPF —'}
                          sx={{ borderRadius: 2, fontWeight: 900, bgcolor: 'rgba(7,26,43,0.05)' }}
                        />
                        <Chip
                          size="small"
                          label={`CBO: ${i.cbo || '—'}`}
                          sx={{ borderRadius: 2, fontWeight: 900, bgcolor: 'rgba(7,26,43,0.05)' }}
                        />
                        <Chip
                          size="small"
                          label={`Admissão: ${i.data_admissao || '—'}`}
                          sx={{ borderRadius: 2, fontWeight: 900, bgcolor: `${AQUA.yellow}18`, border: `1px solid ${AQUA.yellow}35` }}
                        />
                      </Stack>

                      <Typography variant="body2" sx={{ mt: 0.9, color: 'text.secondary' }}>
                        <b>Função:</b> {i.funcao || '—'} &nbsp;&nbsp;•&nbsp;&nbsp;
                        <b>Setor:</b> {i.setor || '—'}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Tooltip title="Editar">
                        <IconButton onClick={() => openEdit(i)} sx={{ borderRadius: 2, color: AQUA.blue }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Excluir">
                        <IconButton onClick={() => openDelete(i)} sx={{ borderRadius: 2, color: '#d32f2f' }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Editar */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 900 }}>Editar Funcionário</DialogTitle>
          <DialogContent dividers>
            {editItem && (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nome"
                    fullWidth
                    value={editItem.nome || ''}
                    onChange={e => setEditItem({ ...editItem, nome: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label="CPF"
                    fullWidth
                    value={editItem.cpf || ''}
                    onChange={e => setEditItem({ ...editItem, cpf: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label="CBO"
                    fullWidth
                    value={editItem.cbo || ''}
                    onChange={e => setEditItem({ ...editItem, cbo: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label="Admissão"
                    type="date"
                    fullWidth
                    value={editItem.data_admissao || ''}
                    onChange={e => setEditItem({ ...editItem, data_admissao: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label="Função"
                    fullWidth
                    value={editItem.funcao || ''}
                    onChange={e => setEditItem({ ...editItem, funcao: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label="Setor"
                    fullWidth
                    value={editItem.setor || ''}
                    onChange={e => setEditItem({ ...editItem, setor: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setEditOpen(false)}
              startIcon={<CloseOutlinedIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={saveEdit}
              startIcon={<SaveOutlinedIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 900 }}
            >
              Salvar alterações
            </Button>
          </DialogActions>
        </Dialog>

        {/* Excluir */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
          <DialogTitle sx={{ fontWeight: 900 }}>Excluir Funcionário?</DialogTitle>
          <DialogContent>Essa ação não pode ser desfeita.</DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteOpen(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}>
              Cancelar
            </Button>
            <Button color="error" variant="contained" onClick={confirmDelete} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 900 }}>
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.sev} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}