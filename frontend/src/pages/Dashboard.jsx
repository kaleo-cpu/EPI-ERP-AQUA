import React, { useEffect, useMemo, useState } from 'react'
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  TextField,
  MenuItem,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Chip,
  Divider,
  Tooltip as MuiTooltip
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'
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

const COLORS = [
  AQUA.blue, '#2F80ED', '#00A3FF', '#00C2FF', '#00D1B2',
  AQUA.yellow, '#FFB300', '#FF8F00', '#FF6F00', '#FF4D4D'
]

const DIAS_OPCOES = [7, 15, 30, 60, 90, 120, 180, 365]

function KpiCard({ title, value, subtitle, accent = AQUA.blue, loading = false }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid rgba(7,26,43,0.08)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)',
        overflow: 'hidden',
        position: 'relative',
        minHeight: 128,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(700px 160px at 10% 0%, ${accent}18, transparent 55%)`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 6,
          height: '100%',
          background: `linear-gradient(180deg, ${accent} 0%, ${accent}66 70%, ${accent}22 100%)`,
        }}
      />
      <CardContent sx={{ p: 2.2 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 800 }}>
          {title}
        </Typography>

        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: -0.5,
              color: AQUA.ink,
              lineHeight: 1.1
            }}
          >
            {loading ? '—' : value}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Stack>

        {loading ? (
          <LinearProgress sx={{ mt: 2, borderRadius: 999 }} />
        ) : (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: accent,
                boxShadow: `0 0 0 4px ${accent}22`
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Atualizado conforme período selecionado
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [kpis, setKpis] = useState({
    consumo_por_setor: [],
    top_consumidores: [],
    proximos_vencimentos: [],
  })
  const [loading, setLoading] = useState(false)
  const [dias, setDias] = useState(30)

  const load = async () => {
    setLoading(true)
    try {
      // se seu endpoint aceitar ?dias=, ótimo; caso não, remova o query param
      const { data } = await api.get(`/dashboard/kpis/?dias=${dias}`)
      setKpis(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [dias])

  // --- Transforms para os gráficos ---
  const consumoSetorData = useMemo(() => {
    // esperado: [{ funcionario__setor, total }]
    return (kpis.consumo_por_setor || []).map((r, idx) => ({
      setor: r['funcionario__setor'] || '—',
      total: Number(r.total || 0),
      color: COLORS[idx % COLORS.length]
    }))
  }, [kpis])

  const topConsumidoresData = useMemo(() => {
    // esperado: [{ funcionario__nome, total }]
    return (kpis.top_consumidores || []).slice(0, 10).map((r, idx) => ({
      nome: r['funcionario__nome'] || '—',
      total: Number(r.total || 0),
      color: COLORS[idx % COLORS.length]
    }))
  }, [kpis])

  const vencimentosSeries = useMemo(() => {
    // esperado: [{ funcionario__nome, epi__nome, data_validade_prevista }]
    // agregamos por dia (YYYY-MM-DD)
    const counter = {}
    for (const row of (kpis.proximos_vencimentos || [])) {
      const dia = (row['data_validade_prevista'] || '').slice(0, 10)
      if (!dia) continue
      counter[dia] = (counter[dia] || 0) + 1
    }
    const items = Object.entries(counter)
      .map(([date, qtd]) => ({ date, qtd }))
      .sort((a, b) => a.date.localeCompare(b.date))
    return items
  }, [kpis])

  // KPIs rápidos
  const kpiTotais = useMemo(() => {
    const totalConsumo = consumoSetorData.reduce((s, r) => s + r.total, 0)
    const totalLinhasVenc = kpis.proximos_vencimentos?.length || 0
    const setoresUnicos = new Set(consumoSetorData.map(r => r.setor)).size
    const colaboradoresRanq = topConsumidoresData.length
    return { totalConsumo, totalLinhasVenc, setoresUnicos, colaboradoresRanq }
  }, [consumoSetorData, topConsumidoresData, kpis])

  return (
    <Box
      sx={{
        minHeight: '100%',
        pb: 6,
        background: `
          radial-gradient(1100px 360px at 10% 0%, ${AQUA.yellow}14, transparent 55%),
          radial-gradient(900px 360px at 90% 10%, ${AQUA.blue}18, transparent 58%),
          linear-gradient(180deg, rgba(7,26,43,0.03) 0%, rgba(7,26,43,0.00) 40%, rgba(7,26,43,0.02) 100%)
        `,
      }}
    >
      <Container sx={{ mt: 3 }}>
        {/* Header “hero” */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.2, md: 3 },
            mb: 2.2,
            borderRadius: 2,
            border: '1px solid rgba(7,26,43,0.08)',
            background: `
              radial-gradient(900px 240px at 12% 20%, ${AQUA.yellow}20, transparent 60%),
              radial-gradient(900px 240px at 88% 15%, ${AQUA.blue}22, transparent 60%),
              linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.86) 100%)
            `,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: 6,
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
                Dashboard
              </Typography>
              <Typography sx={{ mt: 0.8, color: 'text.secondary', fontWeight: 600 }}>
                Visão geral de consumos, vencimentos e ranking • Aqua Slides
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
                <Chip
                  size="small"
                  label={`Período: ${dias} dias`}
                  sx={{
                    fontWeight: 900,
                    bgcolor: `${AQUA.blue}14`,
                    color: AQUA.blue,
                    border: `1px solid ${AQUA.blue}2A`
                  }}
                />
                <Chip
                  size="small"
                  label="EPIs • Entregas"
                  sx={{
                    fontWeight: 900,
                    bgcolor: `${AQUA.yellow}1A`,
                    color: '#8A5A00',
                    border: `1px solid ${AQUA.yellow}33`
                  }}
                />
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <MuiTooltip title="Selecione o horizonte de análise">
                <TextField
                  select
                  size="small"
                  label="Horizonte"
                  value={dias}
                  onChange={e => setDias(Number(e.target.value))}
                  sx={{
                    minWidth: 190,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'rgba(7,26,43,0.02)'
                    },
                    '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                      borderColor: AQUA.blue
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: AQUA.blue
                    }
                  }}
                >
                  {DIAS_OPCOES.map(d => <MenuItem key={d} value={d}>{d} dias</MenuItem>)}
                </TextField>
              </MuiTooltip>
            </Stack>
          </Stack>

          {loading ? <LinearProgress sx={{ mt: 2, borderRadius: 999 }} /> : null}
        </Paper>

        {/* KPIs */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Consumos (total)"
              value={kpiTotais.totalConsumo}
              subtitle="no período"
              accent={AQUA.blue}
              loading={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Vencimentos previstos"
              value={kpiTotais.totalLinhasVenc}
              subtitle={`até ${dias} dias`}
              accent={AQUA.yellow2}
              loading={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Setores ativos"
              value={kpiTotais.setoresUnicos}
              subtitle="com consumo"
              accent="#00A3FF"
              loading={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              title="Top colaboradores"
              value={kpiTotais.colaboradoresRanq}
              subtitle="no ranking"
              accent="#FF8F00"
              loading={loading}
            />
          </Grid>
        </Grid>

        {/* Gráficos */}
        <Grid container spacing={2}>
          {/* Consumo por Setor */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: 2,
                height: 440,
                border: '1px solid rgba(7,26,43,0.08)',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)'
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
                    Consumo por Setor
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Distribuição do consumo no período selecionado
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={`${consumoSetorData.length} setores`}
                  sx={{
                    fontWeight: 900,
                    bgcolor: `${AQUA.blue}10`,
                    color: AQUA.blue,
                    border: `1px solid ${AQUA.blue}20`
                  }}
                />
              </Stack>

              <Divider sx={{ mb: 1.5 }} />

              <ResponsiveContainer width="100%" height="82%">
                <BarChart data={consumoSetorData} barCategoryGap={18}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="setor" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Consumo" radius={[10, 10, 0, 0]}>
                    {consumoSetorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Top Consumidores */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: 2,
                height: 440,
                border: '1px solid rgba(7,26,43,0.08)',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)'
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
                    Top Consumidores
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Até 10 colaboradores com maior consumo
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={`${topConsumidoresData.length} itens`}
                  sx={{
                    fontWeight: 900,
                    bgcolor: `${AQUA.yellow}16`,
                    color: '#8A5A00',
                    border: `1px solid ${AQUA.yellow}35`
                  }}
                />
              </Stack>

              <Divider sx={{ mb: 1.5 }} />

              <ResponsiveContainer width="100%" height="82%">
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie
                    data={topConsumidoresData}
                    dataKey="total"
                    nameKey="nome"
                    innerRadius={62}
                    outerRadius={120}
                    paddingAngle={2}
                  >
                    {topConsumidoresData.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Vencimentos por Dia */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: 2,
                height: 400,
                border: '1px solid rgba(7,26,43,0.08)',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)'
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
                    Vencimentos por Dia
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Próximos {dias} dias • quantidade agregada por data
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={`${vencimentosSeries.length} datas`}
                  sx={{
                    fontWeight: 900,
                    bgcolor: `${AQUA.blue}10`,
                    color: AQUA.blue,
                    border: `1px solid ${AQUA.blue}20`
                  }}
                />
              </Stack>

              <Divider sx={{ mb: 1.5 }} />

              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={vencimentosSeries}>
                  <defs>
                    <linearGradient id="colorVenc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={AQUA.yellow} stopOpacity={0.85} />
                      <stop offset="95%" stopColor={AQUA.yellow} stopOpacity={0.10} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="qtd"
                    name="Qtd."
                    stroke={AQUA.yellow2}
                    strokeWidth={2}
                    fill="url(#colorVenc)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}