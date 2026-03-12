import { Alert, AlertTitle, Box } from '@mui/material';
import { ReactNode } from 'react';

interface AlertBannerProps {
  severity: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

const AlertBanner = ({ severity, title, children, onClose }: AlertBannerProps) => (
  <Alert
    severity={severity}
    onClose={onClose}
    sx={{ mb: 2.5, borderRadius: 3, '& .MuiAlert-icon': { alignItems: 'center' } }}
  >
    {title && <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>}
    {children}
  </Alert>
);

export default AlertBanner;
