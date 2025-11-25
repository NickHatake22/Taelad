// src/components/TaeTeDaMas/MonthlyDetailTable.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
} from "@mui/material";
import { SistemaChip } from "./SistemaChip";
import {
  cellSx,
  colorForStatus,
  currency,
  fmtDate,
  pct,
  yyyymm,
} from "./utils";

type GananciaRow = {
  id: number | string;
  monto: number | string | null;
  status?: string | null;
  sistema?: string | null;
  nombre_referido?: string | null;
  nombre_producto?: string | null;
  producto_nombre?: string | null;
  origen?: string | null;
  porcentaje_comision?: number | string | null;
  fecha_registro?: string | null;
  created_at?: string | null;
};

type Props = {
  ganancias: GananciaRow[];
  loadingTablas: boolean;
  monthFilter: string;
  onMonthChange: (value: string) => void;
  isSelectedMonth: (g: GananciaRow) => boolean;
  isPendingOld: (g: GananciaRow) => boolean;
};

// 🔹 Helper: obtiene el día "DD" del string de fecha (YYYY-MM-DD...)
function getDayFromStr(src?: string | null): string | null {
  if (!src) return null;
  const plain = String(src).slice(0, 10); // "YYYY-MM-DD"
  const parts = plain.split("-");
  if (parts.length < 3) return null;
  return parts[2]; // "DD"
}

export function MonthlyDetailTable({
  ganancias,
  loadingTablas,
  monthFilter,
  onMonthChange,
  isSelectedMonth,
  isPendingOld,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // 🔹 1) Primero filtramos por MES
  const byMonth = useMemo(
    () => ganancias.filter(isSelectedMonth),
    [ganancias, isSelectedMonth]
  );

  // 🔹 2) Estado para filtrar por DÍA (string "all" o "01", "02", etc.)
  const [dayFilter, setDayFilter] = useState<string>("all");

  // Cuando cambia el mes, reseteamos el filtro de día
  useEffect(() => {
    setDayFilter("all");
  }, [monthFilter]);

  // 🔹 3) Calculamos la lista de días que tienen movimientos en ese mes (por string, no Date)
  const daysAvailable = useMemo(() => {
    const set = new Set<string>();
    byMonth.forEach((g) => {
      const day = getDayFromStr(g.fecha_registro || g.created_at);
      if (day) set.add(day);
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [byMonth]);

  // 🔹 4) Aplicamos el filtro por día
  const filtered = useMemo(() => {
    if (dayFilter === "all") return byMonth;
    return byMonth.filter((g) => {
      const day = getDayFromStr(g.fecha_registro || g.created_at);
      return day === dayFilter;
    });
  }, [byMonth, dayFilter]);

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
    <Card sx={{ mt: 2 }}>
      <CardContent sx={{ p: { xs: 1.25, md: 2 } }}>
        {/* Filtro de mes */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 1 }}
          spacing={1}
        >
          <Typography
            fontWeight={800}
            sx={{ fontSize: { xs: 13, md: 16 } }}
          >
            Más detalles de tus Ganancias
          </Typography>
          <TextField
            label="Mes"
            type="month"
            size="small"
            value={monthFilter}
            onChange={(e) => onMonthChange(e.target.value)}
            inputProps={{ max: yyyymm(new Date()) }}
            sx={{ width: { xs: "100%", sm: 220 } }}
          />
        </Stack>

        {/* 🔹 Tabs por día del mes */}
        {byMonth.length > 0 && (
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

        {/* 📱 Vista móvil: tarjetas */}
        {isMobile ? (
          <>
            {filtered.length === 0 || loadingTablas ? (
              renderEmptyOrLoading()
            ) : (
              <Stack spacing={1}>
                {filtered.map((g) => {
                  const oldPend = isPendingOld(g);
                  const producto =
                    g.nombre_producto || g.producto_nombre || g.origen || "—";

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
                      {/* Fecha + Status */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 0.5 }}
                      >
                        <Typography
                          sx={{ fontSize: 12, fontWeight: 500 }}
                        >
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

                      {/* Producto */}
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          mb: 0.25,
                        }}
                      >
                        {producto}
                      </Typography>

                      {/* Referido + Sistema */}
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 0.5 }}
                      >
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "text.secondary",
                            flexGrow: 1,
                          }}
                        >
                          Referido:{" "}
                          <strong>{g.nombre_referido || "—"}</strong>
                        </Typography>
                        <SistemaChip value={g.sistema} />
                      </Stack>

                      {/* Monto + % comisión */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          sx={{ fontSize: 12, fontWeight: 600 }}
                        >
                          Monto: {currency(g.monto)}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "text.secondary",
                          }}
                        >
                          % Comisión: {pct(g.porcentaje_comision)}
                        </Typography>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </>
        ) : (
          // 💻 Escritorio: tabla completa
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 420,
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Table size="small" stickyHeader sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={cellSx}>Fecha</TableCell>
                  <TableCell sx={cellSx}>Referido</TableCell>
                  <TableCell sx={cellSx}>Sistema</TableCell>
                  <TableCell sx={cellSx}>Producto</TableCell>
                  <TableCell sx={{ ...cellSx }} align="right">
                    Monto
                  </TableCell>
                  <TableCell sx={cellSx}>% Comisión</TableCell>
                  <TableCell sx={cellSx}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTablas ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={cellSx}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <CircularProgress size={16} />
                        <Typography sx={{ fontSize: 13 }}>
                          Cargando…
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={cellSx}>
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
                        <TableCell sx={cellSx}>
                          {g.nombre_referido || "—"}
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
                        <TableCell sx={cellSx} align="right">
                          {currency(g.monto)}
                        </TableCell>
                        <TableCell sx={cellSx}>
                          {pct(g.porcentaje_comision)}
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Chip
                            size="small"
                            label={g.status}
                            color={colorForStatus(g.status)}
                            variant={oldPend ? "outlined" : "filled"}
                            sx={{ fontSize: 11 }}
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
