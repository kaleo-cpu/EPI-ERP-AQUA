import React, { useEffect, useMemo, useState } from 'react'
import {
  Container, Typography, Paper, Box, Button, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, LinearProgress, Divider, Stack, Chip, Tooltip, Avatar
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import api from '../api/client'

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

const PERFIS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'colaborador', label: 'Colaborador' },
]

// Gera uma cor consistente baseado no texto (nome)
function colorFromText(text = '') {
  const str = String(text || '').trim().toLowerCase()
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  // Paleta de cores “vivas” (sem mudar função, só UI)
  const palette = [
    '#0B5ED7', '#FFC400', '#17A2B8', '#28A745', '#6F42C1',
    '#FD7E14', '#20C997', '#DC3545', '#6610F2', '#0DCAF0'
  ]
  const idx = Math.abs(hash) % palette.length
  return palette[idx]
}

function initialFromName(name = '') {
  const n = String(name || '').trim()
  if (!n) return '?'
  return n[0].toUpperCase()
}

export default function Usuarios() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [form, setForm] = useState({
    id: null,
    nome: '',
    email: '',
    perfil: 'colaborador',
    senha: '',
  })

  const [busca, setBusca] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      // ajuste a rota conforme seu backend: /usuarios/ (DRF ModelViewSet)
      const { data } = await api.get('/usuarios/')
      setRows(Array.isArray(data) ? data : (data.results || []))
    } catch (e) {
      console.error('Falha ao listar usuários', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setIsEdit(false)
    setForm({ id: null, nome: '', email: '', perfil: 'colaborador', senha: '' })
    setOpen(true)
  }

  const openEdit = (u) => {
    setIsEdit(true)
    setForm({ id: u.id, nome: u.nome || '', email: u.email || '', perfil: u.perfil || 'colaborador', senha: '' })
    setOpen(true)
  }

  const salvar = async () => {
    try {
      const payload = { nome: form.nome, email: form.email, perfil: form.perfil }
      if (!isEdit) payload.senha = form.senha // senha só na criação
      if (isEdit && form.senha) payload.senha = form.senha // permitir reset

      if (isEdit) {
        await api.put(`/usuarios/${form.id}/`, payload)
      } else {
        await api.post('/usuarios/', payload)
      }
      setOpen(false)
      await load()
    } catch (e) {
      console.error('Falha ao salvar usuário', e)
      alert('Não foi possível salvar o usuário.')
    }
  }

  const excluir = async (id) => {
    if (!window.confirm('Excluir este usuário?')) return
    try {
      await api.delete(`/usuarios/${id}/`)
      await load()
    } catch (e) {
      console.error('Falha ao excluir usuário', e)
      alert('Não foi possível excluir.')
    }
  }

  const filtrados = useMemo(() => {
    return rows.filter(r => {
      if (!busca.trim()) return true
      const q = busca.toLowerCase()
      return String(r.nome || '').toLowerCase().includes(q) ||
        String(r.email || '').toLowerCase().includes(q) ||
        String(r.perfil || '').toLowerCase().includes(q)
    })
  }, [rows, busca])

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

          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.6, color: AQUA.ink, lineHeight: 1.05 }}>
                Usuários
              </Typography>
              <Typography sx={{ mt: 0.6, color: 'text.secondary', fontWeight: 600 }}>
                Cadastro, edição e exclusão de usuários do sistema
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1.4, flexWrap: 'wrap', rowGap: 1 }}>
                <Chip
                  size="small"
                  label={`${filtrados.length} exibidos`}
                  sx={{ fontWeight: 900, bgcolor: `${AQUA.yellow}18`, color: '#8A5A00', border: `1px solid ${AQUA.yellow}35`, borderRadius: 2 }}
                />
                <Chip
                  size="small"
                  label={`${rows.length} total`}
                  sx={{ fontWeight: 900, bgcolor: `${AQUA.blue}12`, color: AQUA.blue, border: `1px solid ${AQUA.blue}22`, borderRadius: 2 }}
                />
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
              <TextField
                size="small"
                label="Buscar"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                sx={{
                  minWidth: { xs: '100%', sm: 320 },
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(7,26,43,0.02)' },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: AQUA.blue },
                  '& .MuiInputLabel-root.Mui-focused': { color: AQUA.blue },
                }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openCreate}
                sx={{
                  borderRadius: 2,
                  fontWeight: 900,
                  textTransform: 'none',
                  py: 1.05,
                  background: `linear-gradient(135deg, ${AQUA.blue} 0%, ${AQUA.blue2} 60%, ${AQUA.blue} 100%)`,
                  boxShadow: '0 10px 22px rgba(11,94,215,0.20)',
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Novo usuário
              </Button>
            </Box>
          </Stack>

          {loading ? <LinearProgress sx={{ mt: 2, borderRadius: 2 }} /> : null}
        </Paper>

        {/* Tabela */}
        <Paper
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: 2,
            border: '1px solid rgba(7,26,43,0.08)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
            Usuários cadastrados
          </Typography>
          <Divider sx={{ my: 1.5 }} />

          <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(7,26,43,0.08)' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900, color: AQUA.ink, bgcolor: 'rgba(7,26,43,0.02)' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: AQUA.ink, bgcolor: 'rgba(7,26,43,0.02)' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: AQUA.ink, bgcolor: 'rgba(7,26,43,0.02)' }}>Perfil</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: AQUA.ink, bgcolor: 'rgba(7,26,43,0.02)' }} align="right">Ações</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtrados.map(u => {
                  const bg = colorFromText(u.nome || u.email || String(u.id))
                  const letter = initialFromName(u.nome || u.email || '')
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                        <Stack direction="row" alignItems="center" spacing={1.2}>
                          {/* ✅ círculo colorido com inicial */}
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '999px',
                              bgcolor: bg,
                              color: '#fff',
                              fontWeight: 950,
                              fontSize: 14,
                              boxShadow: '0 8px 16px rgba(7,26,43,0.12)'
                            }}
                          >
                            {letter}
                          </Avatar>

                          <Typography sx={{ fontWeight: 900, color: AQUA.ink }}>
                            {u.nome}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                        {u.email}
                      </TableCell>

                      <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                        <Chip
                          size="small"
                          label={u.perfil}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 900,
                            bgcolor:
                              u.perfil === 'admin'
                                ? `${AQUA.yellow}22`
                                : u.perfil === 'gestor'
                                  ? `${AQUA.blue}12`
                                  : 'rgba(7,26,43,0.06)',
                            border:
                              u.perfil === 'admin'
                                ? `1px solid ${AQUA.yellow}45`
                                : u.perfil === 'gestor'
                                  ? `1px solid ${AQUA.blue}22`
                                  : '1px solid rgba(7,26,43,0.10)',
                            color:
                              u.perfil === 'admin'
                                ? '#7A4C00'
                                : u.perfil === 'gestor'
                                  ? AQUA.blue
                                  : 'rgba(7,26,43,0.75)'
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }} align="right">
                        <Tooltip title="Editar">
                          <IconButton onClick={() => openEdit(u)} sx={{ borderRadius: 2 }}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton color="error" onClick={() => excluir(u.id)} sx={{ borderRadius: 2 }}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {!filtrados.length && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Modal */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 900 }}>{isEdit ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <TextField
                label="Nome"
                fullWidth
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                select
                label="Perfil"
                fullWidth
                value={form.perfil}
                onChange={e => setForm({ ...form, perfil: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                {PERFIS.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
              </TextField>

              {!isEdit && (
                <TextField
                  label="Senha"
                  type="password"
                  fullWidth
                  value={form.senha}
                  onChange={e => setForm({ ...form, senha: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}

              {isEdit && (
                <TextField
                  label="Nova senha (opcional)"
                  type="password"
                  fullWidth
                  value={form.senha}
                  onChange={e => setForm({ ...form, senha: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpen(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={salvar}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 900 }}
            >
              {isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}