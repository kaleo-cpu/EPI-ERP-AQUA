import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  MenuItem,
  Grid,
  Paper,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'

const CATEGORIAS = [
  { value: 'calçado', label: 'Calçado' },
  { value: 'ocular', label: 'Proteção Ocular' },
  { value: 'respiratória', label: 'Proteção Respiratória' },
  { value: 'auditiva', label: 'Proteção Auditiva' },
  { value: 'cabeça', label: 'Cabeça' },
  { value: 'mãos', label: 'Mãos' },
  { value: 'corpo', label: 'Corpo' },
  { value: 'outros', label: 'Outros' },
]

export default function EPIs() {
  const [epis, setEpis] = useState([])

  // Cadastro EPI
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('outros')
  const [tempo, setTempo] = useState(180)
  const [numeroCa, setNumeroCa] = useState('')
  const [validadeCa, setValidadeCa] = useState('')
  const [fabricante, setFabricante] = useState('')
  const [modelo, setModelo] = useState('')
  const [unidade, setUnidade] = useState('un')
  const [alertaMin, setAlertaMin] = useState(0)
  const [observacoes, setObservacoes] = useState('')

  // Entrada de estoque (lote) — fluxo atual (após criar EPI)
  const [epiCriado, setEpiCriado] = useState(null)
  const [lote, setLote] = useState('')
  const [nfNumero, setNfNumero] = useState('')
  const [nfSerie, setNfSerie] = useState('')
  const [fornecedorCnpj, setFornecedorCnpj] = useState('')
  const [dataCompra, setDataCompra] = useState('')
  const [quantidade, setQuantidade] = useState(0)
  const [localArmazenamento, setLocalArmazenamento] = useState('')

  // UI / feedback
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' })
  const [loading, setLoading] = useState(false)

  // Editar EPI
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  // Excluir EPI
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)

  // Buscar EPIs
  const [busca, setBusca] = useState('')

  // ===== NOVO (somente isso): Gerenciar lotes de um EPI já cadastrado =====
  const [lotesOpen, setLotesOpen] = useState(false)
  const [lotesLoading, setLotesLoading] = useState(false)
  const [lotesEpi, setLotesEpi] = useState(null)
  const [lotes, setLotes] = useState([])

  const [loteEditOpen, setLoteEditOpen] = useState(false)
  const [loteEditMode, setLoteEditMode] = useState('create') // 'create' | 'edit'
  const [loteEditItem, setLoteEditItem] = useState({
    id: null,
    lote: '',
    nf_numero: '',
    nf_serie: '',
    fornecedor_cnpj: '',
    data_compra: '',
    quantidade: 0,
    local_armazenamento: ''
  })

  const [loteDeleteOpen, setLoteDeleteOpen] = useState(false)
  const [loteDeleteItem, setLoteDeleteItem] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/epis/')
      setEpis(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const episFiltrados = useMemo(() => {
    const q = (busca || '').trim().toLowerCase()
    if (!q) return epis
    return epis.filter(e =>
      String(e.nome || '').toLowerCase().includes(q) ||
      String(e.categoria || '').toLowerCase().includes(q) ||
      String(e.numero_ca || '').toLowerCase().includes(q) ||
      String(e.fabricante || '').toLowerCase().includes(q) ||
      String(e.modelo || '').toLowerCase().includes(q)
    )
  }, [epis, busca])

  const addEpi = async () => {
    try {
      const payload = {
        nome,
        categoria,
        tempo_validade_dias: Number(tempo),
        numero_ca: numeroCa,
        validade_ca: validadeCa || null,
        fabricante,
        modelo,
        unidade,
        alerta_estoque_min: Number(alertaMin),
        observacoes
      }
      const res = await api.post('/epis/', payload)
      setEpiCriado(res.data)
      setSnack({ open: true, msg: 'EPI cadastrado com sucesso. Você pode lançar a entrada de estoque abaixo.', sev: 'success' })
      setNome('')
      setCategoria('outros')
      setTempo(180)
      setNumeroCa('')
      setValidadeCa('')
      setFabricante('')
      setModelo('')
      setUnidade('un')
      setAlertaMin(0)
      setObservacoes('')
      load()
    } catch (e) {
      setSnack({ open: true, msg: 'Falha ao cadastrar EPI', sev: 'error' })
    }
  }

  const addEstoque = async () => {
    if (!epiCriado) {
      setSnack({ open: true, msg: 'Cadastre o EPI primeiro.', sev: 'warning' })
      return
    }
    try {
      const payload = {
        epi: epiCriado.id,
        lote,
        nf_numero: nfNumero,
        nf_serie: nfSerie,
        fornecedor_cnpj: fornecedorCnpj,
        data_compra: dataCompra,
        quantidade: Number(quantidade),
        local_armazenamento: localArmazenamento
      }
      await api.post('/estoques/', payload)
      setSnack({ open: true, msg: 'Entrada de estoque registrada.', sev: 'success' })
      setLote('')
      setNfNumero('')
      setNfSerie('')
      setFornecedorCnpj('')
      setDataCompra('')
      setQuantidade(0)
      setLocalArmazenamento('')

      // se modal de lotes estiver aberto para o mesmo EPI, atualiza lista
      if (lotesOpen && lotesEpi?.id === epiCriado.id) {
        await fetchLotes(epiCriado)
      }
    } catch (e) {
      setSnack({ open: true, msg: 'Falha ao registrar estoque', sev: 'error' })
    }
  }

  // ===== EDITAR EPI (já existia) =====
  const openEdit = (item) => { setEditItem({ ...item }); setEditOpen(true) }
  const saveEdit = async () => {
    try {
      const id = editItem.id
      const payload = {
        nome: editItem.nome,
        categoria: editItem.categoria,
        tempo_validade_dias: Number(editItem.tempo_validade_dias),
        numero_ca: editItem.numero_ca,
        validade_ca: editItem.validade_ca || null,
        fabricante: editItem.fabricante,
        modelo: editItem.modelo,
        unidade: editItem.unidade,
        alerta_estoque_min: Number(editItem.alerta_estoque_min),
        observacoes: editItem.observacoes
      }
      await api.put(`/epis/${id}/`, payload)
      setSnack({ open: true, msg: 'EPI atualizado.', sev: 'success' })
      setEditOpen(false); setEditItem(null)
      load()
    } catch (e) {
      setSnack({ open: true, msg: 'Falha ao atualizar EPI', sev: 'error' })
    }
  }

  const openDelete = (item) => { setDeleteItem(item); setDeleteOpen(true) }
  const confirmDelete = async () => {
    try {
      await api.delete(`/epis/${deleteItem.id}/`)
      setSnack({ open: true, msg: 'EPI excluído.', sev: 'success' })
      setDeleteOpen(false); setDeleteItem(null)
      load()
    } catch (e) {
      setSnack({ open: true, msg: 'Não foi possível excluir (existem entregas/estoques vinculados?).', sev: 'error' })
    }
  }

  // ===== NOVO: Funções de lote (gerenciar lote de EPI já cadastrado) =====
  const fetchLotes = async (epi) => {
    if (!epi?.id) return
    setLotesLoading(true)
    try {
      // mesmo endpoint usado na página Entrega
      const res = await api.get(`/epis/${epi.id}/lotes/`)
      setLotes(Array.isArray(res.data) ? res.data : (res.data.results || []))
    } catch (e) {
      setSnack({ open: true, msg: 'Falha ao carregar lotes deste EPI', sev: 'error' })
      setLotes([])
    } finally {
      setLotesLoading(false)
    }
  }

  const openGerenciarLotes = async (epi) => {
    setLotesEpi(epi)
    setLotesOpen(true)
    await fetchLotes(epi)
  }

  const openNovoLote = () => {
    setLoteEditMode('create')
    setLoteEditItem({
      id: null,
      lote: '',
      nf_numero: '',
      nf_serie: '',
      fornecedor_cnpj: '',
      data_compra: '',
      quantidade: 0,
      local_armazenamento: ''
    })
    setLoteEditOpen(true)
  }

  const openEditarLote = (l) => {
    // alguns campos podem não vir no /lotes/; mantemos fallback para não quebrar
    setLoteEditMode('edit')
    setLoteEditItem({
      id: l.id,
      lote: l.lote ?? '',
      nf_numero: l.nf_numero ?? '',
      nf_serie: l.nf_serie ?? '',
      fornecedor_cnpj: l.fornecedor_cnpj ?? '',
      data_compra: l.data_compra ?? '',
      quantidade: Number(l.quantidade ?? 0),
      local_armazenamento: l.local_armazenamento ?? ''
    })
    setLoteEditOpen(true)
  }

  const salvarLote = async () => {
    if (!lotesEpi?.id) return
    try {
      const payload = {
        epi: lotesEpi.id,
        lote: loteEditItem.lote,
        nf_numero: loteEditItem.nf_numero,
        nf_serie: loteEditItem.nf_serie,
        fornecedor_cnpj: loteEditItem.fornecedor_cnpj,
        data_compra: loteEditItem.data_compra,
        quantidade: Number(loteEditItem.quantidade),
        local_armazenamento: loteEditItem.local_armazenamento
      }

      if (loteEditMode === 'create') {
        await api.post('/estoques/', payload)
        setSnack({ open: true, msg: 'Lote adicionado.', sev: 'success' })
      } else {
        await api.put(`/estoques/${loteEditItem.id}/`, payload)
        setSnack({ open: true, msg: 'Lote atualizado.', sev: 'success' })
      }

      setLoteEditOpen(false)
      await fetchLotes(lotesEpi)
    } catch (e) {
      setSnack({ open: true, msg: 'Falha ao salvar lote', sev: 'error' })
    }
  }

  const openExcluirLote = (l) => {
    setLoteDeleteItem(l)
    setLoteDeleteOpen(true)
  }

  const confirmarExcluirLote = async () => {
    try {
      await api.delete(`/estoques/${loteDeleteItem.id}/`)
      setSnack({ open: true, msg: 'Lote excluído.', sev: 'success' })
      setLoteDeleteOpen(false)
      setLoteDeleteItem(null)
      await fetchLotes(lotesEpi)
    } catch (e) {
      setSnack({ open: true, msg: 'Falha ao excluir lote', sev: 'error' })
    }
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Cadastro de EPI</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="Nome" fullWidth value={nome} onChange={e => setNome(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select label="Categoria" fullWidth value={categoria} onChange={e => setCategoria(e.target.value)}>
              {CATEGORIAS.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Validade (dias)" type="number" fullWidth value={tempo} onChange={e => setTempo(e.target.value)} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField label="Nº CA" fullWidth value={numeroCa} onChange={e => setNumeroCa(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Validade do CA" type="date" fullWidth value={validadeCa} onChange={e => setValidadeCa(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Fabricante" fullWidth value={fabricante} onChange={e => setFabricante(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Modelo" fullWidth value={modelo} onChange={e => setModelo(e.target.value)} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField label="Unidade" fullWidth value={unidade} onChange={e => setUnidade(e.target.value)} placeholder="un, par, cx..." />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Alerta estoque mínimo" type="number" fullWidth value={alertaMin} onChange={e => setAlertaMin(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Observações" fullWidth multiline minRows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)} />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={addEpi}>Salvar EPI</Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom>Entrada de Estoque (por lote)</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField label="Lote" fullWidth value={lote} onChange={e => setLote(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="NF - Número" fullWidth value={nfNumero} onChange={e => setNfNumero(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField label="NF - Série" fullWidth value={nfSerie} onChange={e => setNfSerie(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Fornecedor (CNPJ)" fullWidth value={fornecedorCnpj} onChange={e => setFornecedorCnpj(e.target.value)} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField label="Data da compra" type="date" fullWidth value={dataCompra} onChange={e => setDataCompra(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Quantidade" type="number" fullWidth value={quantidade} onChange={e => setQuantidade(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Local de armazenamento" fullWidth value={localArmazenamento} onChange={e => setLocalArmazenamento(e.target.value)} />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" color="secondary" onClick={addEstoque} disabled={!epiCriado}>Registrar entrada</Button>
          </Grid>
        </Grid>
        {!epiCriado && <Typography variant="body2" sx={{ mt: 1 }}>Cadastre e salve o EPI primeiro para liberar a entrada de estoque.</Typography>}
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>EPIs cadastrados</Typography>

      {/* Busca (já existia no arquivo original como estado; mantendo sem mudar lógica) */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Buscar EPI"
          fullWidth
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </Box>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={1}>
          {episFiltrados.map(e => (
            <Grid key={e.id} item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography sx={{ minWidth: 220 }}><b>{e.nome}</b> ({e.categoria})</Typography>
                  <Typography>CA: {e.numero_ca || '—'}</Typography>
                  <Typography>Val.(dias): {e.tempo_validade_dias}</Typography>
                  <Typography>Fabricante: {e.fabricante || '—'}</Typography>
                  <Typography>Modelo: {e.modelo || '—'}</Typography>
                  <Typography>Alerta mín.: {e.alerta_estoque_min}</Typography>
                </Box>

                <Box>
                  {/* ✅ NOVO: Gerenciar lotes do EPI já cadastrado */}
                  <Tooltip title="Gerenciar lotes deste EPI">
                    <IconButton onClick={() => openGerenciarLotes(e)} title="Lotes">
                      <Inventory2OutlinedIcon />
                    </IconButton>
                  </Tooltip>

                  <IconButton color="primary" onClick={() => openEdit(e)} title="Editar"><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => openDelete(e)} title="Excluir"><DeleteIcon /></IconButton>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Edit Dialog EPI (já existia) */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar EPI</DialogTitle>
        <DialogContent dividers>
          {editItem && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <TextField label="Nome" fullWidth value={editItem.nome || ''} onChange={e => setEditItem({ ...editItem, nome: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select label="Categoria" fullWidth value={editItem.categoria || 'outros'} onChange={e => setEditItem({ ...editItem, categoria: e.target.value })}>
                  {CATEGORIAS.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Validade (dias)" type="number" fullWidth value={editItem.tempo_validade_dias || 0} onChange={e => setEditItem({ ...editItem, tempo_validade_dias: e.target.value })} />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField label="Nº CA" fullWidth value={editItem.numero_ca || ''} onChange={e => setEditItem({ ...editItem, numero_ca: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Validade do CA" type="date" fullWidth value={editItem.validade_ca || ''} onChange={e => setEditItem({ ...editItem, validade_ca: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Fabricante" fullWidth value={editItem.fabricante || ''} onChange={e => setEditItem({ ...editItem, fabricante: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Modelo" fullWidth value={editItem.modelo || ''} onChange={e => setEditItem({ ...editItem, modelo: e.target.value })} />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField label="Unidade" fullWidth value={editItem.unidade || 'un'} onChange={e => setEditItem({ ...editItem, unidade: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Alerta estoque mínimo" type="number" fullWidth value={editItem.alerta_estoque_min || 0} onChange={e => setEditItem({ ...editItem, alerta_estoque_min: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Observações" fullWidth multiline minRows={2} value={editItem.observacoes || ''} onChange={e => setEditItem({ ...editItem, observacoes: e.target.value })} />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveEdit}>Salvar alterações</Button>
        </DialogActions>
      </Dialog>

      {/* Delete EPI Dialog (já existia) */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Excluir EPI?</DialogTitle>
        <DialogContent>Essa ação não pode ser desfeita.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Excluir</Button>
        </DialogActions>
      </Dialog>

      {/* ===== NOVO: Modal Gerenciar Lotes ===== */}
      <Dialog open={lotesOpen} onClose={() => setLotesOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Gerenciar lotes — {lotesEpi?.nome || ''}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={openNovoLote}
            >
              Novo lote
            </Button>
          </Box>

          {lotesLoading ? (
            <Typography>Carregando lotes…</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Lote</b></TableCell>
                  <TableCell><b>Quantidade</b></TableCell>
                  <TableCell><b>Local</b></TableCell>
                  <TableCell align="right"><b>Ações</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lotes.map(l => (
                  <TableRow key={l.id} hover>
                    <TableCell>{l.lote || '—'}</TableCell>
                    <TableCell>{l.quantidade ?? '—'}</TableCell>
                    <TableCell>{l.local_armazenamento || '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => openEditarLote(l)} title="Editar lote">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => openExcluirLote(l)} title="Excluir lote">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {!lotes.length && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Nenhum lote cadastrado para este EPI.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions>
          <Button startIcon={<CloseOutlinedIcon />} onClick={() => setLotesOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== NOVO: Modal Novo/Editar Lote ===== */}
      <Dialog open={loteEditOpen} onClose={() => setLoteEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{loteEditMode === 'create' ? 'Novo lote' : 'Editar lote'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Lote"
                fullWidth
                value={loteEditItem.lote}
                onChange={e => setLoteEditItem({ ...loteEditItem, lote: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="NF - Número"
                fullWidth
                value={loteEditItem.nf_numero}
                onChange={e => setLoteEditItem({ ...loteEditItem, nf_numero: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                label="NF - Série"
                fullWidth
                value={loteEditItem.nf_serie}
                onChange={e => setLoteEditItem({ ...loteEditItem, nf_serie: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Fornecedor (CNPJ)"
                fullWidth
                value={loteEditItem.fornecedor_cnpj}
                onChange={e => setLoteEditItem({ ...loteEditItem, fornecedor_cnpj: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Data da compra"
                type="date"
                fullWidth
                value={loteEditItem.data_compra}
                onChange={e => setLoteEditItem({ ...loteEditItem, data_compra: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Quantidade"
                type="number"
                fullWidth
                value={loteEditItem.quantidade}
                onChange={e => setLoteEditItem({ ...loteEditItem, quantidade: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Local de armazenamento"
                fullWidth
                value={loteEditItem.local_armazenamento}
                onChange={e => setLoteEditItem({ ...loteEditItem, local_armazenamento: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button startIcon={<CloseOutlinedIcon />} onClick={() => setLoteEditOpen(false)}>
            Cancelar
          </Button>
          <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={salvarLote}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== NOVO: Confirmar exclusão de lote ===== */}
      <Dialog open={loteDeleteOpen} onClose={() => setLoteDeleteOpen(false)}>
        <DialogTitle>Excluir lote?</DialogTitle>
        <DialogContent>Essa ação não pode ser desfeita.</DialogContent>
        <DialogActions>
          <Button onClick={() => setLoteDeleteOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmarExcluirLote}>Excluir</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  )
}