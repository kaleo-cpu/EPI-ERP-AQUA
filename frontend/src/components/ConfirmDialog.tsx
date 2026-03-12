import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { Warning, ErrorOutline } from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

const ConfirmDialog = ({
  open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  onConfirm, onCancel, destructive = false,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
      <Box
        sx={{
          width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: destructive ? '#FFEBEE' : '#FFF8E1',
        }}
      >
        {destructive
          ? <ErrorOutline sx={{ color: '#C62828', fontSize: 22 }} />
          : <Warning sx={{ color: '#F57F17', fontSize: 22 }} />
        }
      </Box>
      {title}
    </DialogTitle>
    <DialogContent>
      <Typography variant="body2" sx={{ color: '#5A6A7E', lineHeight: 1.7 }}>{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
      <Button variant="outlined" onClick={onCancel} sx={{ borderColor: '#E3E8EF', color: '#5A6A7E', flex: 1 }}>
        {cancelLabel}
      </Button>
      <Button
        variant="contained"
        onClick={onConfirm}
        sx={destructive ? {
          bgcolor: '#C62828', flex: 1,
          background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #C62828 0%, #B71C1C 100%)', boxShadow: '0px 4px 12px rgba(198,40,40,0.35)' },
        } : { flex: 1 }}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
