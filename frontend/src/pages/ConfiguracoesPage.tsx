import { Box, Grid, TextField } from '@mui/material';
import PageHeader from '../components/PageHeader';
import FormSectionCard from '../components/FormSectionCard';

const ConfiguracoesPage = () => (
  <Box>
    <PageHeader title="Configurações" subtitle="Preferências e parâmetros do sistema" />
    <FormSectionCard title="Dados da Empresa" subtitle="Informações gerais da organização">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Nome da Empresa" defaultValue="Indústria EPI Ltda." size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="CNPJ" defaultValue="12.345.678/0001-00" size="small" />
        </Grid>
        <Grid size={12}>
          <TextField fullWidth label="Endereço" defaultValue="Rua Industrial, 1000 - São Paulo, SP" size="small" />
        </Grid>
      </Grid>
    </FormSectionCard>
    <FormSectionCard title="Parâmetros de Estoque" subtitle="Defina valores mínimos e alertas">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Estoque Mínimo Padrão" defaultValue="10" size="small" type="number" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Dias para Alerta de Vencimento" defaultValue="30" size="small" type="number" />
        </Grid>
      </Grid>
    </FormSectionCard>
  </Box>
);

export default ConfiguracoesPage;
