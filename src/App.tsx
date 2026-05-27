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
  const [selectedLines, setSelectedLines] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['all'];

    // Nouveau stockage: tableau
    const rawMulti = window.localStorage.getItem('tcl_selectedLines');
    if (rawMulti) {
      try {
        const parsed = JSON.parse(rawMulti);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Ignore si localStorage contient une valeur invalide
      }
    }

    // Compatibilité: ancien stockage (string)
    const legacy = window.localStorage.getItem('tcl_selectedLine');
    if (legacy) return legacy === 'all' ? ['all'] : [legacy];

    return ['all'];
  });
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('tcl_selectedLines', JSON.stringify(selectedLines));
    } catch {
      // localStorage peut être bloqué en mode navigation privée
    }
  }, [selectedLines]);

  const showAll = selectedLines.includes('all') || selectedLines.length === 0;
  const normalizedSelectedLines = useMemo(() => {
    if (showAll) return ['all'];
    // Unicité + stable pour éviter des rerenders inutiles
    return Array.from(new Set(selectedLines));
  }, [selectedLines, showAll]);

  const availableLines = useMemo(() => {
    const lines = new Set(vehicles.map((v) => v.lineNumber));
    return Array.from(lines).sort(sortLineNumbers);
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    if (showAll) return vehicles;
    const selectedSet = new Set(normalizedSelectedLines);
    return vehicles.filter((v) => selectedSet.has(v.lineNumber));
  }, [vehicles, normalizedSelectedLines, showAll]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static" elevation={1} style={{ paddingBottom: '10px'   }}>
          <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 , paddingTop: '30px' }}>
              Bus en direct
            </Typography>
            <LineFilter 
              lines={availableLines}
              selectedLines={normalizedSelectedLines}
              onChange={(lines) => setSelectedLines(lines)}
              vehicleCount={filteredVehicles.length}
            />
            {lastUpdate && (
              <Typography variant="caption" sx={{ opacity: 0.9 , paddingTop: '40px' }}>
                Maj. {lastUpdate.toLocaleTimeString('fr-FR')}
              </Typography>
            )}
            </div>
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
              selectedLines={normalizedSelectedLines}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
