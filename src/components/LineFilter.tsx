import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';

interface LineFilterProps {
  lines: string[];
  selectedLine: string;
  onChange: (line: string) => void;
  vehicleCount: number;
}

export function LineFilter({
  lines,
  selectedLine,
  onChange,
  vehicleCount,
}: LineFilterProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
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
        value={selectedLine}
        label="Ligne de bus"
        onChange={handleChange}
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
          <MenuItem key={line} value={line} sx={{ color: '#ffffff' ,size: '5px'}}>
            Ligne {line}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
