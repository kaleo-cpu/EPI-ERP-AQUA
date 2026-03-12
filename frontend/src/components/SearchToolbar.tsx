import { Box, TextField, InputAdornment, Button } from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { ReactNode } from 'react';

interface SearchToolbarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  actions?: ReactNode;
}

const SearchToolbar = ({ placeholder = 'Buscar...', value = '', onChange, actions }: SearchToolbarProps) => (
  <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      sx={{ flex: 1, minWidth: 220 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search sx={{ fontSize: 20, color: '#9CA3AF' }} />
          </InputAdornment>
        ),
      }}
    />
    <Button variant="outlined" startIcon={<FilterList />} sx={{ borderColor: '#E3E8EF', color: '#5A6A7E' }}>
      Filtros
    </Button>
    {actions}
  </Box>
);

export default SearchToolbar;
