import { Box, Typography, Button } from '@mui/material';
import { Inbox } from '@mui/icons-material';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({
  title = 'Nenhum registro encontrado',
  description = 'Não há dados para exibir no momento.',
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
    <Box sx={{ color: '#D1D5DB', mb: 2 }}>
      {icon || <Inbox sx={{ fontSize: 64 }} />}
    </Box>
    <Typography variant="h5" sx={{ mb: 1 }}>{title}</Typography>
    <Typography variant="body2" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>{description}</Typography>
    {actionLabel && (
      <Button variant="contained" onClick={onAction}>{actionLabel}</Button>
    )}
  </Box>
);

export default EmptyState;
