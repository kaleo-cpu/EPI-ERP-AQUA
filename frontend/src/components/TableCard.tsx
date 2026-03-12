import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
}

interface TableCardProps {
  title?: string;
  subtitle?: string;
  columns: Column[];
  rows: any[];
  actions?: ReactNode;
}

const TableCard = ({ title, subtitle, columns, rows, actions }: TableCardProps) => (
  <Card>
    {(title || actions) && (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2.5, pb: 0 }}>
        <Box>
          {title && <Typography variant="h5">{title}</Typography>}
          {subtitle && <Typography variant="body2">{subtitle}</Typography>}
        </Box>
        {actions}
      </Box>
    )}
    <CardContent sx={{ px: 0, pb: '16px !important' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
);

export default TableCard;
