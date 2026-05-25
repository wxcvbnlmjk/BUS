import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { fetchVehicles } from './api/vehicleMonitoring';
import { BusMap } from './components/BusMap';
import { LineFilter } from './components/LineFilter';
import { sortLineNumbers } from './utils/lineRef';
import type { BusVehicle } from './types/siri';
import './App.css';

const POLL_INTERVAL_MS = 60_000;

const theme = createTheme({
  palette: {
    primary: { main: '#c8102e' },
    secondary: { main: '#003da5' },
  },
});

function App() {
  const [vehicles, setVehicles] = useState<BusVehicle[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadVehicles = useCallback(async () => {
    try {
      const data = await fetchVehicles();
      setVehicles(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVehicles();
    const interval = setInterval(() => void loadVehicles(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadVehicles]);

  const availableLines = useMemo(() => {
    const lines = new Set(vehicles.map((v) => v.lineNumber));
    return Array.from(lines).sort(sortLineNumbers);
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    if (selectedLine === 'all') return vehicles;
    return vehicles.filter((v) => v.lineNumber === selectedLine);
  }, [vehicles, selectedLine]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static" elevation={1}>
          <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              TCL — Bus en temps réel
            </Typography>
            <LineFilter
              lines={availableLines}
              selectedLine={selectedLine}
              onChange={setSelectedLine}
              vehicleCount={filteredVehicles.length}
            />
            {lastUpdate && (
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                MAJ {lastUpdate.toLocaleTimeString('fr-FR')}
              </Typography>
            )}
          </Toolbar>
        </AppBar>

        {error && (
          <Container maxWidth="lg" sx={{ pt: 1 }}>
            <Alert severity="error">{error}</Alert>
          </Container>
        )}

        <Box sx={{ flex: 1, position: 'relative' }}>
          {loading && vehicles.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <BusMap
              vehicles={filteredVehicles}
              selectedLine={selectedLine}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
