import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import {
  Container,
  Typography,
  TextField,
  Box,
  Button,
  Paper,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
  Stack,
  Tooltip
} from '@mui/material'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid
} from 'recharts'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'

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

function diasEntre(a, b) {
  // retorna diferença inteira em dias (b - a)
  const MS = 24 * 60 * 60 * 1000
  const ad = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const bd = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.round((bd - ad) / MS)
}

function statusChip(dateISO) {
  if (!dateISO) {
    return (
      <Chip
        size="small"
        label="—"
        sx={{ borderRadius: 2, fontWeight: 900, bgcolor: 'rgba(7,26,43,0.06)' }}
      />
    )
  }

  const hoje = new Date()
  const d = new Date(dateISO)
  const diff = diasEntre(hoje, d) // positivo = vence no futuro

  if (diff < 0) {
    return (
      <Chip
        size="small"
        color="error"
        label="Vencido"
        sx={{ borderRadius: 2, fontWeight: 900 }}
      />
    )
  }
  if (diff === 0) {
    return (
      <Chip
        size="small"
        color="warning"
        label="Hoje"
        sx={{ borderRadius: 2, fontWeight: 900 }}
      />
    )
  }
  if (diff <= 7) {
    return (
      <Chip
        size="small"
        color="warning"
        label={`Em ${diff}d`}
        sx={{ borderRadius: 2, fontWeight: 900 }}
      />
    )
  }
  return (
    <Chip
      size="small"
      color="success"
      label={`Em ${diff}d`}
      sx={{ borderRadius: 2, fontWeight: 900 }}
    />
  )
}

export default function Monitor() {
  const [items, setItems] = useState([])
  const [dias, setDias] = useState(30)
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/monitor/validade/?dias=${dias}`)
      setItems(Array.isArray(data) ? data : (data.results || []))
    } finally {
      setLoading(false)
    }
  }

  // carrega D-30 ao abrir
  useEffect(() => { load() }, []) // não muda lógica (apenas evita Promise no useEffect)

  // Filtragem local por texto (funcionário/EPI)
  const filtrados = useMemo(() => {
    if (!busca.trim()) return items
    const q = busca.toLowerCase()
    return items.filter(i =>
      String(i['funcionario__nome'] || '').toLowerCase().includes(q) ||
      String(i['epi__nome'] || '').toLowerCase().includes(q)
    )
  }, [items, busca])

  // Série para o gráfico: agrega quantidade por dia (YYYY-MM-DD)
  const serie = useMemo(() => {
    const map = {}
    for (const it of items) {
      const dia = String(it['data_validade_prevista'] || '').slice(0, 10)
      if (!dia) continue
      map[dia] = (map[dia] || 0) + 1
    }
    return Object.entries(map)
      .map(([date, qtd]) => ({ date, qtd }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [items])

  // KPIs simples
  const kpis = useMemo(() => {
    const hoje = new Date()
    let vencidos = 0, ate7 = 0, total = items.length
    for (const it of items) {
      const d = it['data_validade_prevista']
      if (!d) continue
      const diff = diasEntre(hoje, new Date(d))
      if (diff < 0) vencidos++
      else if (diff <= 7) ate7++
    }
    return { total, vencidos, ate7 }
  }, [items])

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
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 950, letterSpacing: -0.6, color: AQUA.ink, lineHeight: 1.05 }}
              >
                Monitor de Validade de EPI
              </Typography>
              <Typography sx={{ mt: 0.6, color: 'text.secondary', fontWeight: 600 }}>
                Acompanhe vencimentos, itens críticos e próximos alertas
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1.4, flexWrap: 'wrap', rowGap: 1 }}>
                <Chip
                  size="small"
                  icon={<FactCheckOutlinedIcon />}
                  label="Validades previstas"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 900,
                    bgcolor: `${AQUA.blue}12`,
                    color: AQUA.blue,
                    border: `1px solid ${AQUA.blue}22`
                  }}
                />
                <Chip
                  size="small"
                  icon={<CalendarMonthOutlinedIcon />}
                  label={`Horizonte: ${dias} dias`}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 900,
                    bgcolor: `${AQUA.yellow}18`,
                    color: '#8A5A00',
                    border: `1px solid ${AQUA.yellow}35`
                  }}
                />
              </Stack>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Tooltip title="Quantidade de dias à frente para buscar vencimentos">
                <TextField
                  label="Horizonte (dias)"
                  type="number"
                  size="small"
                  value={dias}
                  onChange={e => setDias(Number(e.target.value))}
                  sx={{
                    width: { xs: '100%', sm: 180 },
                    '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(7,26,43,0.02)' },
                    '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: AQUA.blue },
                    '& .MuiInputLabel-root.Mui-focused': { color: AQUA.blue },
                  }}
                />
              </Tooltip>

              <Button
                variant="contained"
                onClick={load}
                sx={{
                  borderRadius: 2,
                  fontWeight: 900,
                  textTransform: 'none',
                  py: 1.05,
                  background: `linear-gradient(135deg, ${AQUA.blue} 0%, ${AQUA.blue2} 60%, ${AQUA.blue} 100%)`,
                  boxShadow: '0 10px 22px rgba(11,94,215,0.20)'
                }}
              >
                Aplicar
              </Button>
            </Stack>
          </Stack>

          {loading ? <LinearProgress sx={{ mt: 2, borderRadius: 2 }} /> : null}
        </Paper>

        {/* KPIs */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: 2,
                border: '1px solid rgba(7,26,43,0.08)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)'
              }}
            >
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 900 }}>
                Total no horizonte
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 950, color: AQUA.ink, lineHeight: 1.1 }}>
                {kpis.total}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: 2,
                border: '1px solid rgba(7,26,43,0.08)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)'
              }}
            >
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 900 }}>
                Vencidos
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 950, color: 'error.main', lineHeight: 1.1 }}>
                {kpis.vencidos}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: 2,
                border: '1px solid rgba(7,26,43,0.08)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)'
              }}
            >
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 900 }}>
                Vencem ≤ 7 dias
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 950, color: 'warning.main', lineHeight: 1.1 }}>
                {kpis.ate7}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Gráfico */}
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
          <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
            Vencimentos por dia
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            Quantidade agregada por data de validade prevista
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serie}>
                <defs>
                  <linearGradient id="gradVencAqua" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AQUA.yellow2} stopOpacity={0.85} />
                    <stop offset="95%" stopColor={AQUA.yellow2} stopOpacity={0.10} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <ReTooltip />
                <Area
                  type="monotone"
                  dataKey="qtd"
                  name="Qtd."
                  stroke={AQUA.yellow2}
                  strokeWidth={2}
                  fill="url(#gradVencAqua)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Filtros + Tabela */}
        <Paper
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: 2,
            border: '1px solid rgba(7,26,43,0.08)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)'
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
                Lista de itens
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Use o filtro para encontrar funcionário ou EPI rapidamente
              </Typography>
            </Box>

            <TextField
              label="Buscar por funcionário ou EPI"
              size="small"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Digite parte do nome…"
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'text.secondary' }}>
                    <SearchOutlinedIcon fontSize="small" />
                  </Box>
                )
              }}
              sx={{
                minWidth: { xs: '100%', md: 380 },
                '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(7,26,43,0.02)' },
                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: AQUA.blue },
                '& .MuiInputLabel-root.Mui-focused': { color: AQUA.blue },
              }}
            />
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {filtrados.length} itens
            </Typography>
            <Chip
              size="small"
              label={loading ? 'Atualizando…' : 'Atualizado'}
              sx={{
                borderRadius: 2,
                fontWeight: 900,
                bgcolor: loading ? 'rgba(255,196,0,0.18)' : `${AQUA.blue}10`,
                color: loading ? '#8A5A00' : AQUA.blue,
                border: `1px solid ${loading ? `${AQUA.yellow}35` : `${AQUA.blue}18`}`
              }}
            />
          </Stack>

          <TableContainer sx={{ maxHeight: 520, borderRadius: 2, border: '1px solid rgba(7,26,43,0.08)' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {['Funcionário', 'EPI', 'Lote', 'Quantidade', 'Validade', 'Status'].map(h => (
                    <TableCell
                      key={h}
                      sx={{
                        fontWeight: 900,
                        color: AQUA.ink,
                        borderBottom: '1px solid rgba(7,26,43,0.10)',
                        bgcolor: 'rgba(7,26,43,0.02)'
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filtrados.map((i, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {i['funcionario__nome']}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {i['epi__nome']}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {i['lote'] || '—'}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {i['quantidade'] || 1}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {String(i['data_validade_prevista'] || '').slice(0, 10)}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {statusChip(i['data_validade_prevista'])}
                    </TableCell>
                  </TableRow>
                ))}

                {!filtrados.length && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Sem itens para o filtro atual.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  )
}