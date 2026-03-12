import { Card, CardContent, Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  trend?: string;
}

const InfoCard = ({ title, value, icon, color = '#0B5ED7', trend }: InfoCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>{title}</Typography>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>{value}</Typography>
          {trend && (
            <Typography sx={{ fontSize: '0.75rem', color: trend.startsWith('+') ? '#2E7D32' : '#5A6A7E', mt: 0.5, fontWeight: 600 }}>
              {trend}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            backgroundColor: `${color}12`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default InfoCard;
