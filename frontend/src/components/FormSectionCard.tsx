import { Card, CardContent, Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

interface FormSectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const FormSectionCard = ({ title, subtitle, children }: FormSectionCardProps) => (
  <Card sx={{ mb: 2.5 }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ mb: 0.5 }}>{title}</Typography>
        {subtitle && <Typography variant="body2">{subtitle}</Typography>}
      </Box>
      {children}
    </CardContent>
  </Card>
);

export default FormSectionCard;
