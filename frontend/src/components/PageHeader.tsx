import { Box, Typography, Button } from '@mui/material';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
}

const PageHeader = ({ title, subtitle, action, actionLabel, onAction, actionIcon }: PageHeaderProps) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
    <Box>
      <Typography variant="h3" sx={{ mb: 0.5 }}>{title}</Typography>
      {subtitle && <Typography variant="body2">{subtitle}</Typography>}
    </Box>
    {action || (actionLabel && (
      <Button variant="contained" onClick={onAction} startIcon={actionIcon}>
        {actionLabel}
      </Button>
    ))}
  </Box>
);

export default PageHeader;
