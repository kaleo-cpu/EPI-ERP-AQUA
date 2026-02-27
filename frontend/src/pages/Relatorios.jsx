import React, { useEffect, useMemo, useState } from 'react'
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Box,
  Chip,
  Stack,
  Divider,
  LinearProgress,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Tooltip
} from '@mui/material'
import api from '../api/client'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'

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

export default function Relatorios() {
  const [setor, setSetor] = useState('')
  const [categoria, setCategoria] = useState('')
  const [dataDe, setDataDe] = useState('')
  const [dataAte, setDataAte] = useState('')
  const [rows, setRows] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [funcionarioId, setFuncionarioId] = useState('')

  const [loading, setLoading] = useState(false)
  const [loadingFunc, setLoadingFunc] = useState(false)

  const funcionariosOrdenados = useMemo(() => {
    const list = Array.isArray(funcionarios) ? [...funcionarios] : []
    list.sort((a, b) =>
      String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR', { sensitivity: 'base' })
    )
    return list
  }, [funcionarios])

  const funcionarioSelecionado = useMemo(() => {
    if (!funcionarioId) return null
    const idNum = Number(funcionarioId)
    return funcionarios.find(f => Number(f.id) === idNum) || null
  }, [funcionarios, funcionarioId])

  const setoresOrdenados = useMemo(() => {
    // tenta extrair setores a partir do cadastro de funcionários (campo "setor")
    const set = new Set()
    for (const f of funcionarios || []) {
      const s = String(f.setor || '').trim()
      if (s) set.add(s)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }))
  }, [funcionarios])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (setor) params.append('setor', setor)
      if (categoria) params.append('categoria', categoria)
      if (dataDe) params.append('data_de', dataDe)
      if (dataAte) params.append('data_ate', dataAte)
      if (funcionarioId) params.append('funcionario_id', funcionarioId)

      const { data } = await api.get(`/entregas/relatorio/?${params.toString()}`)
      setRows(Array.isArray(data) ? data : (data.results || []))
    } finally {
      setLoading(false)
    }
  }

  // Mantive sua função, só envolvi em try/catch como já estava
  const exportExcel = async () => {
    try {
      const params = new URLSearchParams()
      if (setor) params.append('setor', setor)
      if (categoria) params.append('categoria', categoria)
      if (dataDe) params.append('data_de', dataDe)
      if (dataAte) params.append('data_ate', dataAte)
      if (funcionarioId) params.append('funcionario_id', funcionarioId)

      const res = await api.get(`/entregas/exportar/?${params.toString()}`, {
        responseType: 'blob'
      })

      let filename = 'relatorio_entregas_epi.xlsx'
      const dispo = res.headers?.['content-disposition'] || res.headers?.get?.('content-disposition')
      if (dispo) {
        const match = /filename="?([^"]+)"?/.exec(dispo)
        if (match?.[1]) filename = match[1]
      }

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      try {
        const reader = new FileReader()
        reader.onload = () => {
          alert(`Falha ao exportar: ${reader.result}`)
        }
        reader.readAsText(err.response?.data || new Blob(['Erro ao exportar']))
      } catch {
        alert('Falha ao exportar Excel.')
      }
    }
  }

  useEffect(() => {
    setLoadingFunc(true)
    api.get('/funcionarios/')
      .then(r => setFuncionarios(r.data || []))
      .finally(() => setLoadingFunc(false))
  }, [])

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

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.6, color: AQUA.ink, lineHeight: 1.05 }}>
                Relatórios de Entrega de EPI
              </Typography>
              <Typography sx={{ mt: 0.6, color: 'text.secondary', fontWeight: 600 }}>
                Filtre por funcionário, setor, categoria e período • exporte Excel com 1 clique
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1.4, flexWrap: 'wrap', rowGap: 1 }}>
                <Chip
                  size="small"
                  icon={<AssessmentOutlinedIcon />}
                  label="Relatório"
                  sx={{ fontWeight: 900, bgcolor: `${AQUA.blue}12`, color: AQUA.blue, border: `1px solid ${AQUA.blue}22`, borderRadius: 2 }}
                />
                <Chip
                  size="small"
                  label={`${rows.length} registros`}
                  sx={{ fontWeight: 900, bgcolor: `${AQUA.yellow}18`, color: '#8A5A00', border: `1px solid ${AQUA.yellow}35`, borderRadius: 2 }}
                />
              </Stack>
            </Box>
          </Stack>

          {(loading || loadingFunc) ? <LinearProgress sx={{ mt: 2, borderRadius: 2 }} /> : null}
        </Paper>

        {/* Filtros */}
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
            <FilterAltOutlinedIcon sx={{ color: AQUA.yellow2 }} />
            <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
              Filtros
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {/* Funcionário: Autocomplete (alfabético + digitável) */}
            <Grid item xs={12} md={4}>
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

            {/* Setor: Autocomplete (alfabético + digitável). FreeSolo para permitir setores não cadastrados no funcionário */}
            <Grid item xs={12} md={4}>
              <Autocomplete
                freeSolo
                options={setoresOrdenados}
                value={setor || null}
                onChange={(event, newValue) => setSetor(newValue ? String(newValue) : '')}
                onInputChange={(event, newInputValue) => setSetor(newInputValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Setor"
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
                            <ApartmentOutlinedIcon fontSize="small" />
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
                label="Categoria (Tipo de EPI)"
                fullWidth
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(7,26,43,0.02)' },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: AQUA.blue },
                  '& .MuiInputLabel-root.Mui-focused': { color: AQUA.blue },
                }}
              >
                <MenuItem value="">(todas)</MenuItem>
                {CATEGORIAS.map(c => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Data de"
                type="date"
                fullWidth
                value={dataDe}
                onChange={e => setDataDe(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(7,26,43,0.02)' },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: AQUA.blue },
                  '& .MuiInputLabel-root.Mui-focused': { color: AQUA.blue },
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Data até"
                type="date"
                fullWidth
                value={dataAte}
                onChange={e => setDataAte(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'rgba(7,26,43,0.02)' },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: AQUA.blue },
                  '& .MuiInputLabel-root.Mui-focused': { color: AQUA.blue },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={fetchData}
                  startIcon={<FilterAltOutlinedIcon />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 900,
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${AQUA.blue} 0%, ${AQUA.blue2} 60%, ${AQUA.blue} 100%)`,
                    boxShadow: '0 10px 22px rgba(11,94,215,0.20)'
                  }}
                >
                  Filtrar
                </Button>

                <Tooltip title="Gera e baixa o arquivo Excel com os filtros aplicados">
                  <Button
                    variant="outlined"
                    onClick={exportExcel}
                    startIcon={<FileDownloadOutlinedIcon />}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 900,
                      textTransform: 'none',
                      borderColor: 'rgba(7,26,43,0.20)'
                    }}
                  >
                    Exportar Excel
                  </Button>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: AQUA.ink }}>
              Resultados
            </Typography>
            <Chip
              size="small"
              label={loading ? 'Atualizando…' : 'Pronto'}
              sx={{
                borderRadius: 2,
                fontWeight: 900,
                bgcolor: loading ? 'rgba(255,196,0,0.18)' : `${AQUA.blue}10`,
                color: loading ? '#8A5A00' : AQUA.blue,
                border: `1px solid ${loading ? `${AQUA.yellow}35` : `${AQUA.blue}18`}`
              }}
            />
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          <TableContainer sx={{ maxHeight: 560, borderRadius: 2, border: '1px solid rgba(7,26,43,0.08)' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {['Funcionário', 'Setor', 'EPI', 'Categoria', 'Lote', 'Qtd', 'Entrega', 'Validade até'].map(h => (
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
                {rows.map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>{r.funcionario_nome}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>{r.setor || '—'}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>{r.epi_nome}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>{r.categoria}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>{r.lote || '—'}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>{r.quantidade}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>
                      {r.data_entrega?.slice(0, 16).replace('T', ' ')}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(7,26,43,0.06)' }}>{r.validade_ate || ''}</TableCell>
                  </TableRow>
                ))}

                {!rows.length && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                      Sem registros
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