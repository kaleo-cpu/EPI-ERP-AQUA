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
  Chip,
  Stack,
  LinearProgress,
  Tooltip
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

  // Entrada de estoque (lote)
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

  // ===== NOVO: Gerenciar lotes (editar/excluir) =====
  const [lotesOpen, setLotesOpen] = useState(false)
  const [lotesLoading, setLotesLoading] = useState(false)
  const [lotesEpi, setLotesEpi] = useState(null)
  const [lotes, setLotes] = useState([])

  const [loteEditOpen, setLoteEditOpen] = useState(false)
  const [loteEditItem, setLoteEditItem] = useState(null)

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

  // IMPORTANTE: não passe Promise direto no useEffect
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

      // Se o modal de lotes estiver aberto para o mesmo EPI, atualiza
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
        tempo_validade_dias: Number(editItem.tempo_validade_dias || 0),
        numero_ca: editItem.numero_ca || '',
        validade_ca: editItem.validade_ca || null,
        fabricante: editItem.fabricante || '',
        modelo: editItem.modelo || '',
        unidade: editItem.unidade || 'un',
        alerta_estoque_min: Number(editItem.alerta_estoque_min || 0),
        observacoes: editItem.observacoes || ''
      }
      await api.put(`/epis/${id}/`, payload)
      setSnack({ open: true, msg: 'EPI atualizado.', sev: 'success' })
      setEditOpen(false); setEditItem(null)
      load()
    } catch (e) {
      setSnack({ open: true, msg: 'Falha ao atualizar EPI', sev: 'error' })
    }
  }

  // ===== EXCLUIR EPI (já existia) =====
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

  // ===== NOVO: LOTES (listar / editar / excluir) =====
  const fetchLotes = async (epi) => {
    setLotesLoading(true)
    try {
      // O backend tem ViewSet de EstoqueEPI em /estoques/ (GET lista tudo)
      // Como não tem filtro explícito por query no viewset, filtramos no front:
      const res = await api.get('/estoques/')
      const all = Array.isArray(res.data) ? res.data : []
      const filtrados = all
        .filter(x => Number(x.epi) === Number(epi.id))
        .sort((a, b) => String(b.data_compra || '').localeCompare(String(a.data_compra || '')))
      setLotes(filtrados)
    } catch (e) {
      setSnack({ open: true, msg: 'Falha ao carregar lotes', sev: 'error' })
      setLotes([])
    } finally {
      setLotesLoading(false)
    }
  }

  const openLotes = async (epi) => {
    setLotesEpi(epi)
    setLotesOpen(true)
    await fetchLotes(epi)
  }

  const openLoteEdit = (item) => {
    setLoteEditItem({ ...item })
    setLoteEditOpen(true)
  }

  const saveLoteEdit = async () => {
    try {
      const id = loteEditItem.id
      const payload = {
        epi: Number(loteEditItem.epi),
        lote: loteEditItem.lote || '',
        nf_numero: loteEditItem.nf_numero || '',
        nf_serie: loteEditItem.nf_serie || '',
        fornecedor_cnpj: loteEditItem.fornecedor_cnpj || '',
        data_compra: loteEditItem.data_compra || null,
        quantidade: Number(loteEditItem.quantidade || 0),
        local_armazenamento: loteEditItem.local_armazenamento || ''
      }
      await api.put(`/estoques/${id}/`, payload)
      setSnack({ open: true, msg: 'Lote atualizado.', sev: 'success' })
      setLoteEditOpen(false); setLoteEditItem(null)
      if (lotesEpi) await fetchLotes(lotesEpi)
    } catch (e) {
      setSnack({ open: true, msg: 'Falha ao atualizar lote', sev: 'error' })
    }
  }

  const openLoteDelete = (item) => {
    setLoteDeleteItem(item)
    setLoteDeleteOpen(true)
  }

  const confirmLoteDelete = async () => {
    try {
      await api.delete(`/estoques/${loteDeleteItem.id}/`)
      setSnack({ open: true, msg: 'Lote excluído.', sev: 'success' })
      setLoteDeleteOpen(false); setLoteDeleteItem(null)
      if (lotesEpi) await fetchLotes(lotesEpi)
    } catch (e) {
      setSnack({ open: true, msg: 'Não foi possível excluir lote (pode estar vinculado a entregas).', sev: 'error' })
    }
  }

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
                EPIs
              </Typography>
              <Typography sx={{ mt: 0.6, color: 'text.secondary', fontWeight: 600 }}>
                Cadastro, entrada de estoque por lote e gerenciamento de lotes
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.4, flexWrap: 'wrap', rowGap: 1 }}>
                <Chip
                  size="small"
                  label="Aqua Slides"
                  sx={{ fontWeight: 900, bgcolor: `${AQUA.blue}12`, color: AQUA.blue, border: `1px solid ${AQUA.blue}22`, borderRadius: 2 }}
                />
              </Stack>
            </Box>

            <TextField
              label="Buscar EPI"
              size="small"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              sx={{
                minWidth: { xs: '100%', md: 320 },
                '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(7,26,43,0.02)' },
                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: AQUA.blue },
                '& .MuiInputLabel-root.Mui-focused': { color: AQUA.blue },
              }}
            />
          </Stack>

          {loading ? <LinearProgress sx={{ mt: 2, borderRadius: 2 }} /> : null}
        </Paper>

        {/* Cadastro EPI */}
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
            <AddCircleOutlineIcon sx={{ color: AQUA.blue }} />
            <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
              Cadastrar EPI
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Nome" fullWidth value={nome} onChange={e => setNome(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Categoria"
                fullWidth
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                {CATEGORIAS.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Validade (dias)" type="number" fullWidth value={tempo} onChange={e => setTempo(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField label="Nº CA" fullWidth value={numeroCa} onChange={e => setNumeroCa(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Validade do CA" type="date" fullWidth value={validadeCa} onChange={e => setValidadeCa(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Fabricante" fullWidth value={fabricante} onChange={e => setFabricante(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Modelo" fullWidth value={modelo} onChange={e => setModelo(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField label="Unidade" fullWidth value={unidade} onChange={e => setUnidade(e.target.value)} placeholder="un, par, cx..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Alerta estoque mínimo" type="number" fullWidth value={alertaMin} onChange={e => setAlertaMin(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Observações" fullWidth multiline minRows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={addEpi}
                startIcon={<SaveOutlinedIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 900,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${AQUA.blue} 0%, ${AQUA.blue2} 60%, ${AQUA.blue} 100%)`,
                  boxShadow: '0 10px 22px rgba(11,94,215,0.20)'
                }}
              >
                Salvar EPI
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Entrada de Estoque */}
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
            <Inventory2OutlinedIcon sx={{ color: AQUA.yellow2 }} />
            <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
              Entrada de Estoque (por lote)
            </Typography>
            {epiCriado ? (
              <Chip
                size="small"
                label={`EPI recém-criado: ${epiCriado.nome}`}
                sx={{ ml: 1, borderRadius: 2, fontWeight: 900, bgcolor: `${AQUA.blue}10`, color: AQUA.blue, border: `1px solid ${AQUA.blue}20` }}
              />
            ) : null}
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField label="Lote" fullWidth value={lote} onChange={e => setLote(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="NF - Número" fullWidth value={nfNumero} onChange={e => setNfNumero(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField label="NF - Série" fullWidth value={nfSerie} onChange={e => setNfSerie(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Fornecedor (CNPJ)" fullWidth value={fornecedorCnpj} onChange={e => setFornecedorCnpj(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField label="Data da compra" type="date" fullWidth value={dataCompra} onChange={e => setDataCompra(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Quantidade" type="number" fullWidth value={quantidade} onChange={e => setQuantidade(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Local de armazenamento" fullWidth value={localArmazenamento} onChange={e => setLocalArmazenamento(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>

            <Grid item xs={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Button
                  variant="contained"
                  onClick={addEstoque}
                  disabled={!epiCriado}
                  startIcon={<SaveOutlinedIcon />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 900,
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${AQUA.yellow2} 0%, ${AQUA.yellow} 60%, ${AQUA.yellow2} 100%)`,
                    color: '#1d1d1d',
                    boxShadow: '0 10px 22px rgba(255,196,0,0.22)',
                    '&:hover': { background: `linear-gradient(135deg, ${AQUA.yellow} 0%, ${AQUA.yellow2} 60%, ${AQUA.yellow} 100%)` }
                  }}
                >
                  Registrar entrada
                </Button>

                {!epiCriado ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Cadastre e salve o EPI primeiro para liberar a entrada de estoque.
                  </Typography>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => openLotes(epiCriado)}
                    sx={{ borderRadius: 2, fontWeight: 900, textTransform: 'none' }}
                  >
                    Gerenciar lotes deste EPI
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Lista EPIs */}
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
            <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
              EPIs cadastrados
            </Typography>
            <Chip
              size="small"
              label={`${episFiltrados.length} itens`}
              sx={{ borderRadius: 2, fontWeight: 900, bgcolor: `${AQUA.blue}10`, color: AQUA.blue, border: `1px solid ${AQUA.blue}20` }}
            />
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          <Grid container spacing={1}>
            {episFiltrados.map(e => (
              <Grid key={e.id} item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.6,
                    borderRadius: 2,
                    border: '1px solid rgba(7,26,43,0.08)',
                    bgcolor: 'rgba(255,255,255,0.92)'
                  }}
                >
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={1}>
                        <Typography sx={{ fontWeight: 900, color: AQUA.ink }}>
                          {e.nome}
                        </Typography>
                        <Chip size="small" label={e.categoria} sx={{ borderRadius: 2, fontWeight: 900, bgcolor: `${AQUA.yellow}18`, border: `1px solid ${AQUA.yellow}35` }} />
                        <Chip size="small" label={`Val.: ${e.tempo_validade_dias} dias`} sx={{ borderRadius: 2, fontWeight: 900, bgcolor: 'rgba(7,26,43,0.05)' }} />
                        <Chip size="small" label={`Alerta mín.: ${e.alerta_estoque_min}`} sx={{ borderRadius: 2, fontWeight: 900, bgcolor: `${AQUA.blue}10`, color: AQUA.blue, border: `1px solid ${AQUA.blue}18` }} />
                      </Stack>

                      <Stack direction="row" spacing={2} sx={{ mt: 0.9, flexWrap: 'wrap', rowGap: 0.6 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          <b>CA:</b> {e.numero_ca || '—'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          <b>Fabricante:</b> {e.fabricante || '—'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          <b>Modelo:</b> {e.modelo || '—'}
                        </Typography>
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Tooltip title="Gerenciar lotes (editar/excluir)">
                        <IconButton onClick={() => openLotes(e)} sx={{ borderRadius: 2, color: AQUA.blue }}>
                          <Inventory2OutlinedIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Editar EPI">
                        <IconButton onClick={() => openEdit(e)} sx={{ borderRadius: 2, color: AQUA.blue }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Excluir EPI">
                        <IconButton onClick={() => openDelete(e)} sx={{ borderRadius: 2, color: '#d32f2f' }}>
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

        {/* ===== Dialog: Editar EPI ===== */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 900 }}>Editar EPI</DialogTitle>
          <DialogContent dividers>
            {editItem && (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={6}>
                  <TextField label="Nome" fullWidth value={editItem.nome || ''} onChange={e => setEditItem({ ...editItem, nome: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    label="Categoria"
                    fullWidth
                    value={editItem.categoria || 'outros'}
                    onChange={e => setEditItem({ ...editItem, categoria: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  >
                    {CATEGORIAS.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="Validade (dias)" type="number" fullWidth value={editItem.tempo_validade_dias || 0} onChange={e => setEditItem({ ...editItem, tempo_validade_dias: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField label="Nº CA" fullWidth value={editItem.numero_ca || ''} onChange={e => setEditItem({ ...editItem, numero_ca: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="Validade do CA" type="date" fullWidth value={editItem.validade_ca || ''} onChange={e => setEditItem({ ...editItem, validade_ca: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="Fabricante" fullWidth value={editItem.fabricante || ''} onChange={e => setEditItem({ ...editItem, fabricante: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="Modelo" fullWidth value={editItem.modelo || ''} onChange={e => setEditItem({ ...editItem, modelo: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField label="Unidade" fullWidth value={editItem.unidade || 'un'} onChange={e => setEditItem({ ...editItem, unidade: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="Alerta estoque mínimo" type="number" fullWidth value={editItem.alerta_estoque_min || 0} onChange={e => setEditItem({ ...editItem, alerta_estoque_min: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Observações" fullWidth multiline minRows={2} value={editItem.observacoes || ''} onChange={e => setEditItem({ ...editItem, observacoes: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditOpen(false)} startIcon={<CloseOutlinedIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={saveEdit} startIcon={<SaveOutlinedIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 900 }}>
              Salvar alterações
            </Button>
          </DialogActions>
        </Dialog>

        {/* ===== Dialog: Excluir EPI ===== */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
          <DialogTitle sx={{ fontWeight: 900 }}>Excluir EPI?</DialogTitle>
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

        {/* ===== NOVO Dialog: Gerenciar Lotes ===== */}
        <Dialog open={lotesOpen} onClose={() => setLotesOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 900 }}>
            Gerenciar lotes
            {lotesEpi ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mt: 0.5 }}>
                EPI: <b>{lotesEpi.nome}</b>
              </Typography>
            ) : null}
          </DialogTitle>

          <DialogContent dividers>
            {lotesLoading ? <LinearProgress sx={{ mb: 2, borderRadius: 2 }} /> : null}

            {lotes.length === 0 && !lotesLoading ? (
              <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                Nenhum lote encontrado para este EPI.
              </Alert>
            ) : null}

            <Grid container spacing={1}>
              {lotes.map(l => (
                <Grid item xs={12} key={l.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.4,
                      borderRadius: 2,
                      border: '1px solid rgba(7,26,43,0.08)',
                      bgcolor: 'rgba(255,255,255,0.92)'
                    }}
                  >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={1}>
                          <Chip size="small" label={`Lote: ${l.lote || '—'}`} sx={{ borderRadius: 2, fontWeight: 900, bgcolor: `${AQUA.blue}10`, color: AQUA.blue, border: `1px solid ${AQUA.blue}18` }} />
                          <Chip size="small" label={`Qtd: ${l.quantidade}`} sx={{ borderRadius: 2, fontWeight: 900, bgcolor: `${AQUA.yellow}18`, border: `1px solid ${AQUA.yellow}35` }} />
                          <Chip size="small" label={`NF: ${l.nf_numero || '—'} / ${l.nf_serie || '—'}`} sx={{ borderRadius: 2, fontWeight: 900, bgcolor: 'rgba(7,26,43,0.05)' }} />
                          <Chip size="small" label={`Compra: ${l.data_compra || '—'}`} sx={{ borderRadius: 2, fontWeight: 900, bgcolor: 'rgba(7,26,43,0.05)' }} />
                        </Stack>

                        <Typography variant="body2" sx={{ mt: 0.8, color: 'text.secondary' }}>
                          <b>Fornecedor:</b> {l.fornecedor_cnpj || '—'} &nbsp;&nbsp;•&nbsp;&nbsp;
                          <b>Local:</b> {l.local_armazenamento || '—'}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Editar lote">
                          <IconButton onClick={() => openLoteEdit(l)} sx={{ borderRadius: 2, color: AQUA.blue }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir lote">
                          <IconButton onClick={() => openLoteDelete(l)} sx={{ borderRadius: 2, color: '#d32f2f' }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setLotesOpen(false)} startIcon={<CloseOutlinedIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>

        {/* ===== NOVO Dialog: Editar Lote ===== */}
        <Dialog open={loteEditOpen} onClose={() => setLoteEditOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 900 }}>Editar lote</DialogTitle>
          <DialogContent dividers>
            {loteEditItem && (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={3}>
                  <TextField label="Lote" fullWidth value={loteEditItem.lote || ''} onChange={e => setLoteEditItem({ ...loteEditItem, lote: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="NF - Número" fullWidth value={loteEditItem.nf_numero || ''} onChange={e => setLoteEditItem({ ...loteEditItem, nf_numero: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField label="NF - Série" fullWidth value={loteEditItem.nf_serie || ''} onChange={e => setLoteEditItem({ ...loteEditItem, nf_serie: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Fornecedor (CNPJ)" fullWidth value={loteEditItem.fornecedor_cnpj || ''} onChange={e => setLoteEditItem({ ...loteEditItem, fornecedor_cnpj: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField label="Data da compra" type="date" fullWidth value={loteEditItem.data_compra || ''} onChange={e => setLoteEditItem({ ...loteEditItem, data_compra: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="Quantidade" type="number" fullWidth value={loteEditItem.quantidade ?? 0} onChange={e => setLoteEditItem({ ...loteEditItem, quantidade: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Local de armazenamento" fullWidth value={loteEditItem.local_armazenamento || ''} onChange={e => setLoteEditItem({ ...loteEditItem, local_armazenamento: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setLoteEditOpen(false)} startIcon={<CloseOutlinedIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={saveLoteEdit} startIcon={<SaveOutlinedIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 900 }}>
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* ===== NOVO Dialog: Excluir Lote ===== */}
        <Dialog open={loteDeleteOpen} onClose={() => setLoteDeleteOpen(false)}>
          <DialogTitle sx={{ fontWeight: 900 }}>Excluir lote?</DialogTitle>
          <DialogContent>
            Essa ação não pode ser desfeita. Se o lote estiver vinculado a entregas, o backend pode impedir a exclusão.
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setLoteDeleteOpen(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}>
              Cancelar
            </Button>
            <Button color="error" variant="contained" onClick={confirmLoteDelete} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 900 }}>
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.sev} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}