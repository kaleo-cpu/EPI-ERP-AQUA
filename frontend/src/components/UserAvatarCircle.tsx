import { Avatar, Box, Typography } from '@mui/material';

interface UserAvatarCircleProps {
  name: string;
  subtitle?: string;
  size?: number;
  color?: string;
}

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

const UserAvatarCircle = ({ name, subtitle, size = 36, color = '#0B5ED7' }: UserAvatarCircleProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar sx={{ width: size, height: size, bgcolor: color, fontSize: size * 0.35, fontWeight: 700 }}>
      {getInitials(name)}
    </Avatar>
    <Box>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3 }}>{name}</Typography>
      {subtitle && <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{subtitle}</Typography>}
    </Box>
  </Box>
);

export default UserAvatarCircle;
