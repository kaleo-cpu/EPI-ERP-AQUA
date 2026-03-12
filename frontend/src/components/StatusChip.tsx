import { Chip, ChipProps } from '@mui/material';

interface StatusChipProps {
  label: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'default';
}

const statusColors: Record<string, { bg: string; color: string }> = {
  success: { bg: '#E8F5E9', color: '#2E7D32' },
  warning: { bg: '#FFF8E1', color: '#F57F17' },
  error: { bg: '#FFEBEE', color: '#C62828' },
  info: { bg: '#E3F2FD', color: '#0B5ED7' },
  default: { bg: '#F4F6F9', color: '#5A6A7E' },
};

const StatusChip = ({ label, status }: StatusChipProps) => {
  const colors = statusColors[status] || statusColors.default;
  return (
    <Chip
      label={label}
      size="small"
      sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 600 }}
    />
  );
};

export default StatusChip;
