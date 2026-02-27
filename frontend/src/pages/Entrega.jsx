import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  MenuItem,
  Chip,
  Stack,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  Divider,
  LinearProgress,
  Tooltip,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'

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

export default function Entrega() {
  const [funcionarios, setFuncionarios] = useState([])
  const [epis, setEpis] = useState([])
  const [funcionarioId, setFuncionarioId] = useState('')
  const [sugestoes, setSugestoes] = useState([])
  const [epiId, setEpiId] = useState('')
  const [lotes, setLotes] = useState([])
  const [loteId, setLoteId] = useState('')
  const [quantidade, setQuantidade] = useState(1)

  // últimas entregas
  const [entregas, setEntregas] = useState([])
  const [somenteDoFuncionario, setSomenteDoFuncionario] = useState(true)

  const [loading, setLoading] = useState(false)
  const [loadingLotes, setLoadingLotes] = useState(false)

  const funcionariosOrdenados = useMemo(() => {
    const list = Array.isArray(funcionarios) ? [...funcionarios] : []
    // ordem alfabética por nome
    list.sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR', { sensitivity: 'base' }))
    return list
  }, [funcionarios])

  const funcionarioSelecionado = useMemo(() => {
    if (!funcionarioId) return null
    const idNum = Number(funcionarioId)
    return funcionarios.find(f => Number(f.id) === idNum) || null
  }, [funcionarios, funcionarioId])

  const loadEntregas = async (funcId = null) => {
    const { data } = await api.get('/entregas/')
    const list = Array.isArray(data) ? data : (data.results || [])

    const ordenado = [...list].sort((a, b) => (b.data_entrega || '').localeCompare(a.data_entrega || ''))
    const recorte = ordenado.slice(0, 100)

    if (somenteDoFuncionario && funcId) {
      setEntregas(recorte.filter(e => e.funcionario === funcId).slice(0, 25))
    } else {
      setEntregas(recorte.slice(0, 25))
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/funcionarios/'),
      api.get('/epis/')
    ])
      .then(([rf, re]) => {
        setFuncionarios(rf.data || [])
        setEpis(re.data || [])
      })
      .finally(() => setLoading(false))

    loadEntregas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (funcionarioId) {
      api.get(`/funcionarios/${funcionarioId}/epis-padrao/`).then(res => setSugestoes(res.data))
    } else {
      setSugestoes([])
    }
    loadEntregas(funcionarioId || null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funcionarioId])

  useEffect(() => {
    if (epiId) {
      setLoadingLotes(true)
      api.get(`/epis/${epiId}/lotes/`)
        .then(res => setLotes(res.data))
        .finally(() => setLoadingLotes(false))
    } else {
      setLotes([])
      setLoteId('')
    }
  }, [epiId])

  useEffect(() => {
    loadEntregas(funcionarioId || null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [somenteDoFuncionario])

  const entregar = async () => {
    if (!funcionarioId || !epiId || !loteId) {
      alert('Selecione funcionário, EPI e lote.')
      return
    }
    await api.post('/entregas/entregar/', {
      funcionario_id: Number(funcionarioId),
      epi_id: Number(epiId),
      quantidade: Number(quantidade),
      lote_id: Number(loteId),
      verif_facial_score: 0.9
    })
    alert('Entrega registrada com baixa de estoque por lote.')

    // limpa e recarrega contexto
    setQuantidade(1)
    setLoteId('')
    setEpiId('')
    setLotes([])
    loadEntregas(funcionarioId || null)
  }

  const nomeFuncionarioById = (id) => (funcionarios.find(f => f.id === id) || {}).nome || id
  const nomeEpiById = (id) => (epis.find(x => x.id === id) || {}).nome || id

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
                Entrega de EPI
              </Typography>
              <Typography sx={{ mt: 0.6, color: 'text.secondary', fontWeight: 600 }}>
                Entrega com baixa automática por lote • seleção rápida de funcionário
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1.4, flexWrap: 'wrap', rowGap: 1 }}>
                <Chip
                  size="small"
                  icon={<LocalShippingOutlinedIcon />}
                  label="Baixa por lote"
                  sx={{ fontWeight: 900, bgcolor: `${AQUA.blue}12`, color: AQUA.blue, border: `1px solid ${AQUA.blue}22`, borderRadius: 2 }}
                />
                <Chip
                  size="small"
                  icon={<FactCheckOutlinedIcon />}
                  label="Sugestões por funcionário"
                  sx={{ fontWeight: 900, bgcolor: `${AQUA.yellow}18`, color: '#8A5A00', border: `1px solid ${AQUA.yellow}35`, borderRadius: 2 }}
                />
              </Stack>
            </Box>
          </Stack>

          {loading ? <LinearProgress sx={{ mt: 2, borderRadius: 2 }} /> : null}
        </Paper>

        {/* Form */}
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
              Registrar entrega
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {/* NOVO: Funcionário com Autocomplete (ordem alfabética + busca digitável) */}
            <Grid item xs={12} md={5}>
              <Autocomplete
                options={funcionariosOrdenados}
                value={funcionarioSelecionado}
                onChange={(event, newValue) => setFuncionarioId(newValue ? String(newValue.id) : '')}
                getOptionLabel={(opt) => (opt?.nome ? String(opt.nome) : '')}
                isOptionEqualToValue={(opt, val) => Number(opt?.id) === Number(val?.id)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Funcionário"
                    placeholder="Digite para buscar..."
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(7,26,43,0.02)' },
                      '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: AQUA.blue },
                      '& .MuiInputLabel-root.Mui-focused': { color: AQUA.blue },
                    }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'text.secondary' }}>
                            <PersonSearchOutlinedIcon fontSize="small" />
                          </Box>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                label="EPI"
                value={epiId}
                onChange={e => setEpiId(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(7,26,43,0.02)' },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: AQUA.blue },
                  '& .MuiInputLabel-root.Mui-focused': { color: AQUA.blue },
                }}
              >
                <MenuItem value="" />
                {epis.map(epi => <MenuItem key={epi.id} value={epi.id}>{epi.nome}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Quantidade"
                value={quantidade}
                onChange={e => setQuantidade(e.target.value)}
                type="number"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(7,26,43,0.02)' },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: AQUA.blue },
                  '& .MuiInputLabel-root.Mui-focused': { color: AQUA.blue },
                }}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                select
                label="Lote"
                value={loteId}
                onChange={e => setLoteId(e.target.value)}
                fullWidth
                disabled={!epiId}
                helperText={!epiId ? 'Selecione um EPI para carregar os lotes' : (loadingLotes ? 'Carregando lotes...' : 'Selecione um lote para dar baixa')}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(7,26,43,0.02)' },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: AQUA.blue },
                  '& .MuiInputLabel-root.Mui-focused': { color: AQUA.blue },
                }}
              >
                <MenuItem value="" />
                {lotes.map(l => (
                  <MenuItem key={l.id} value={l.id}>
                    {`${l.lote || '(s/ lote)'} — saldo: ${l.quantidade}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Tooltip title="Registra a entrega e baixa o estoque no lote selecionado">
                <Button
                  fullWidth
                  variant="contained"
                  onClick={entregar}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 900,
                    textTransform: 'none',
                    py: 1.2,
                    background: `linear-gradient(135deg, ${AQUA.blue} 0%, ${AQUA.blue2} 60%, ${AQUA.blue} 100%)`,
                    boxShadow: '0 10px 22px rgba(11,94,215,0.20)'
                  }}
                >
                  Entregar
                </Button>
              </Tooltip>
            </Grid>
          </Grid>

          {/* Sugestões */}
          {sugestoes.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: AQUA.ink }}>
                EPIs padrão para este colaborador
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
                {sugestoes.map(s => (
                  <Chip
                    key={`${s.epi_id}-${s.quantidade_padrao}`}
                    label={`${s.epi_nome} x${s.quantidade_padrao}${s.obrigatorio ? ' (obrigatório)' : ''}`}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 900,
                      bgcolor: s.obrigatorio ? `${AQUA.yellow}22` : `${AQUA.blue}10`,
                      border: `1px solid ${s.obrigatorio ? `${AQUA.yellow}45` : `${AQUA.blue}18`}`,
                      color: s.obrigatorio ? '#7A4C00' : AQUA.blue
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Últimas entregas */}
        <Paper
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: 2,
            border: '1px solid rgba(7,26,43,0.08)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)'
          }}
        >
          <Grid container alignItems="center" justifyContent="space-between" spacing={1}>
            <Grid item>
              <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
                Últimas entregas
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {somenteDoFuncionario ? 'Filtrando pelo funcionário selecionado' : 'Mostrando geral'}
              </Typography>
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Checkbox checked={somenteDoFuncionario} onChange={e => setSomenteDoFuncionario(e.target.checked)} />}
                label="Mostrar apenas do funcionário selecionado"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Funcionário', 'EPI', 'Lote', 'Qtd', 'Entrega', 'Validade (prevista)'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 900, color: AQUA.ink, borderBottom: '1px solid rgba(7,26,43,0.10)' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {entregas.map(e => (
                  <TableRow key={e.id} hover>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {nomeFuncionarioById(e.funcionario)}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {nomeEpiById(e.epi)}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {e.lote || '—'}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {e.quantidade}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {(e.data_entrega || '').slice(0, 16).replace('T', ' ')}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {e.data_validade_prevista || ''}
                    </TableCell>
                  </TableRow>
                ))}
                {!entregas.length && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
                      Sem registros
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}