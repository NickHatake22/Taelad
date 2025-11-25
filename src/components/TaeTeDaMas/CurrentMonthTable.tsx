// src/components/TaeTeDaMas/CurrentMonthTable.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import HistoryIcon from "@mui/icons-material/History";

import { cellSx, colorForStatus, currency, fmtDate } from "./utils";
import { SistemaChip } from "./SistemaChip";

type GananciaRow = {
  id: number | string;
  monto: number | string | null;
  status?: string | null;
  sistema?: string | null;
  nombre_producto?: string | null;
  producto_nombre?: string | null;
  origen?: string | null;
  fecha_registro?: string | null;
  created_at?: string | null;
};

type Props = {
  gananciasMesActual: GananciaRow[];
  loadingTablas: boolean;
  onReload: () => void;
  isPendingOld: (g: GananciaRow) => boolean;
};

// 🔹 Helper local: saca el día "DD" del string YYYY-MM-DD...
function getDayFromStr(src?: string | null): string | null {
  if (!src) return null;
  const plain = String(src).slice(0, 10); // "YYYY-MM-DD"
  const parts = plain.split("-");
  if (parts.length < 3) return null;
  return parts[2]; // "DD"
}

export function CurrentMonthTable({
  gananciasMesActual,
  loadingTablas,
  onReload,
  isPendingOld,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [dayFilter, setDayFilter] = useState<string>("all");

  useEffect(() => {
    setDayFilter("all");
  }, [gananciasMesActual]);

  // 🔹 Días disponibles calculados por string, no por Date
  const daysAvailable = useMemo(() => {
    const set = new Set<string>();
    gananciasMesActual.forEach((g) => {
      const day = getDayFromStr(g.fecha_registro || g.created_at);
      if (day) set.add(day);
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [gananciasMesActual]);

  // 🔹 Lista filtrada por día
  const filtered = useMemo(() => {
    if (dayFilter === "all") return gananciasMesActual;
    return gananciasMesActual.filter((g) => {
      const day = getDayFromStr(g.fecha_registro || g.created_at);
      return day === dayFilter;
    });
  }, [gananciasMesActual, dayFilter]);

  const renderEmptyOrLoading = () => (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        textAlign: "center",
        mt: 1,
      }}
    >
      {loadingTablas ? (
        <Stack direction="row" spacing={1} justifyContent="center">
          <CircularProgress size={16} />
          <Typography sx={{ fontSize: { xs: 11, md: 13 } }}>
            Cargando…
          </Typography>
        </Stack>
      ) : (
        <Typography sx={{ fontSize: { xs: 11, md: 13 } }}>
          Sin registros
        </Typography>
      )}
    </Paper>
  );

  return (
    <Card>
      <CardContent sx={{ p: { xs: 1.25, md: 2 } }}>
        {/* ENCABEZADO */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 1 }}
          spacing={1}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <MonetizationOnIcon fontSize="small" />
            <Typography
              fontWeight={800}
              sx={{ fontSize: { xs: 13, md: 16 } }}
            >
              Ganancias del mes
            </Typography>
          </Stack>

          <Tooltip title="Recargar lista">
            <span>
              <IconButton
                onClick={onReload}
                disabled={loadingTablas}
                size="small"
              >
                <HistoryIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Tabs por día (coherentes con MonthlyDetailTable) */}
        {gananciasMesActual.length > 0 && (
          <Tabs
            value={dayFilter}
            onChange={(_, v) => setDayFilter(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 1,
              minHeight: 32,
              "& .MuiTab-root": {
                minHeight: 32,
                fontSize: { xs: 11, md: 12 },
                textTransform: "none",
                px: 1.5,
              },
            }}
          >
            <Tab value="all" label="Todos" />
            {daysAvailable.map((d) => (
              <Tab key={d} value={d} label={`Día ${parseInt(d, 10)}`} />
            ))}
          </Tabs>
        )}

        <Divider sx={{ mb: 1 }} />

        {/* 📱 MÓVIL → TARJETAS */}
        {isMobile ? (
          <>
            {filtered.length === 0 || loadingTablas ? (
              renderEmptyOrLoading()
            ) : (
              <Stack spacing={1}>
                {filtered.map((g) => {
                  const oldPend = isPendingOld(g);
                  const concepto =
                    g.nombre_producto ||
                    g.producto_nombre ||
                    g.origen ||
                    "—";

                  return (
                    <Paper
                      key={g.id}
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: oldPend ? "#ffebee" : "background.paper",
                      }}
                    >
                      {/* Fecha + status */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 0.5 }}
                      >
                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                          {fmtDate(g.fecha_registro || g.created_at)}
                        </Typography>

                        <Chip
                          size="small"
                          label={g.status}
                          color={colorForStatus(g.status)}
                          variant={oldPend ? "outlined" : "filled"}
                          sx={{ fontSize: 10 }}
                        />
                      </Stack>

                      {/* Concepto */}
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          mb: 0.25,
                        }}
                      >
                        {concepto}
                      </Typography>

                      {/* Sistema */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 0.5 }}
                      >
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "text.secondary",
                          }}
                        >
                          Sistema:
                        </Typography>
                        <SistemaChip value={g.sistema} />
                      </Stack>

                      {/* Monto */}
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Monto: {currency(g.monto)}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </>
        ) : (
          /* 💻 ESCRITORIO → TABLA */
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 320,
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Table size="small" stickyHeader sx={{ minWidth: 520 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={cellSx}>Fecha</TableCell>
                  <TableCell sx={cellSx} align="right">
                    Monto
                  </TableCell>
                  <TableCell sx={cellSx}>Sistema</TableCell>
                  <TableCell sx={cellSx}>Concepto</TableCell>
                  <TableCell sx={cellSx}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTablas ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={cellSx}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={16} />
                        <Typography
                          sx={{ fontSize: { xs: 11, md: 13 } }}
                        >
                          Cargando…
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={cellSx}>
                      Sin registros
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((g) => {
                    const oldPend = isPendingOld(g);

                    return (
                      <TableRow
                        key={g.id}
                        sx={oldPend ? { bgcolor: "#ffebee" } : undefined}
                      >
                        <TableCell sx={cellSx}>
                          {fmtDate(g.fecha_registro || g.created_at)}
                        </TableCell>
                        <TableCell sx={cellSx} align="right">
                          {currency(g.monto)}
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <SistemaChip value={g.sistema} />
                        </TableCell>
                        <TableCell sx={cellSx}>
                          {g.nombre_producto ||
                            g.producto_nombre ||
                            g.origen ||
                            "—"}
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Chip
                            size="small"
                            label={g.status}
                            color={colorForStatus(g.status)}
                            variant={oldPend ? "outlined" : "filled"}
                            sx={{ fontSize: { xs: 10, md: 11 } }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
