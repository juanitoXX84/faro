export const colors = {
  bg: '#071018',
  bgElevated: '#101A24',
  line: 'rgba(243,246,244,0.08)',
  ink: '#F3F6F4',
  muted: '#8FA3A0',
  amber: '#E7B15A',
  mint: '#6FCFC4',
  coral: '#E07A5F',
  paper: '#E8E2D4',
  inkInverse: '#102028',
};

export const priorityColor: Record<'info' | 'aviso' | 'urgente', string> = {
  info: colors.mint,
  aviso: colors.amber,
  urgente: colors.coral,
};

export const avatarPalette = ['#E7B15A', '#6FCFC4', '#E07A5F', '#9BB7D4', '#C7B8EA', '#F0D7A4'];

export function avatarColor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash + char.charCodeAt(0)) % avatarPalette.length;
  return avatarPalette[hash] ?? colors.amber;
}
