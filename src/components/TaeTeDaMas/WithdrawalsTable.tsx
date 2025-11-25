// src/components/TaeTeDaMas/WithdrawalsTable.tsx
import {
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { cellSx, colorForStatus, currency, fmtDate } from "./utils";

type RetiroRow = {
  id: number | string;
  created_at?: string | null;
  metodo?: string | null;
  referencia_pago?: string | null;
  monto: number | string | null;
  status?: string | null;
};

type Props = {
  retiros: RetiroRow[];
  loadingTablas: boolean;
  page: number;
  lastPage: number;
  onChangePage: (page: number) => void;
};

export function WithdrawalsTable({
  retiros,
  loadingTablas,
  page,
  lastPage,
  onChangePage,
}: Props) {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent sx={{ p: { xs: 1.25, md: 2 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 1 }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <HistoryIcon fontSize="small" />
            <Typography
              fontWeight={800}
              sx={{ fontSize: { xs: 13, md: 16 } }}
            >
              Historial de retiros
            </Typography>
          </Stack>
        </Stack>
        <Divider sx={{ mb: 1 }} />

        <TableContainer
          component={Paper}
          sx={{
            maxHeight: { xs: 220, md: 360 },
            width: "100%",
            overflowX: "auto",
          }}
        >
          <Table size="small" stickyHeader sx={{ minWidth: 520 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={cellSx}>Fecha</TableCell>
                <TableCell
                  sx={{
                    ...cellSx,
                    display: { xs: "none", sm: "table-cell" },
                  }}
                >
                  Método
                </TableCell>
                <TableCell
                  sx={{
                    ...cellSx,
                    display: { xs: "none", md: "table-cell" },
                  }}
                >
                  Referencia
                </TableCell>
                <TableCell sx={{ ...cellSx }} align="right">
                  Monto
                </TableCell>
                <TableCell sx={cellSx}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingTablas ? (
                <TableRow>
                  <TableCell colSpan={5} sx={cellSx}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={16} />
                      <Typography sx={{ fontSize: { xs: 11, md: 13 } }}>
                        Cargando…
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : retiros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={cellSx}>
                    Sin registros
                  </TableCell>
                </TableRow>
              ) : (
                retiros.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell sx={cellSx}>
                      {fmtDate(r.created_at)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...cellSx,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      {r.metodo}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...cellSx,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      {r.referencia_pago || "—"}
                    </TableCell>
                    <TableCell sx={cellSx} align="right">
                      {currency(r.monto)}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        size="small"
                        label={r.status}
                        color={colorForStatus(r.status)}
                        sx={{ fontSize: { xs: 10, md: 11 } }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
          <Pagination
            page={page}
            count={lastPage}
            size="small"
            onChange={(_, p) => onChangePage(p)}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
