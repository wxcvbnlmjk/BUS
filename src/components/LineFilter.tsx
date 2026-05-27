import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';

interface LineFilterProps {
  lines: string[];
  selectedLines: string[];
  onChange: (lines: string[]) => void;
  vehicleCount: number;
}

export function LineFilter({
  lines,
  selectedLines,
  onChange,
  vehicleCount,
}: LineFilterProps) {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const next = Array.isArray(value) ? value : [value];

    if (next.length === 0) {
      onChange(['all']);
      return;
    }

    if (next.includes('all')) {
      // Si "Toutes" était déjà sélectionné et qu'on ajoute une ligne,
      // MUI renvoie souvent ["all", "X"] : on interprète ça comme "X".
      if (selectedLines.includes('all') && next.length > 1) {
        onChange(next.filter((v) => v !== 'all'));
        return;
      }

      // Sinon, l'utilisateur a choisi "Toutes" → on écrase le reste.
      onChange(['all']);
      return;
    }

    onChange(next.filter((v) => v !== 'all'));
  };

  return (
    <FormControl
      size="small"
      sx={{
        paddingTop:2,
        minWidth: 100,
        '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.75)' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
        '& .MuiOutlinedInput-root': {
          color: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ffffff',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ffffff',
          },
        },
        '& .MuiSvgIcon-root': { color: '#ffffff' },
      }}
    >
      <InputLabel id="line-filter-label" sx={{
        paddingTop:3}}>Ligne de bus</InputLabel>
      <Select
        labelId="line-filter-label"
        id="line-filter"
        multiple
        value={selectedLines}
        label="Ligne de bus"
        onChange={handleChange}
        renderValue={(selected) => {
          const arr = Array.isArray(selected) ? selected : [selected];
          if (arr.includes('all')) return `Toutes(${vehicleCount})`;
          const max = 3;
          if (arr.length <= max) return `${arr.join(', ')}`;
          const head = arr.slice(0, max).join(', ');
          const remaining = arr.length - max;
          return `${head}… (+${remaining})`;
        }}
        MenuProps={{
          PaperProps: {
            sx: {
    
              bgcolor: '#c8102e',
              '& .MuiMenuItem-root': {
                color: '#ffffff',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' },
                '&.Mui-selected': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.28)',
                },
              },
            },
          },
        }}
      >
        <MenuItem value="all" sx={{ color: '#ffffff' }}>
          Toutes({vehicleCount})
        </MenuItem>
        {lines.map((line) => (
          <MenuItem
            key={line}
            value={line}
            sx={{ color: '#ffffff' }}
          >
            Ligne {line}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
