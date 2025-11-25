// src/components/TaeTeDaMas/MonthlySummaryCard.tsx
import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { currency } from "./utils";

export type ResumenGanancias = {
  ok: number;
  pend: number;
  bad: number;
  total: number;
};

type Props = {
  resumen: ResumenGanancias;
};

export function MonthlySummaryCard({ resumen }: Props) {
  return (
    <Card sx={{ mt: 1.5 }}>
      <CardContent sx={{ p: { xs: 1.25, md: 2 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography
            fontWeight={800}
            sx={{ fontSize: { xs: 13, md: 16 } }}
          >
            Total de Ganancias (mes actual)
          </Typography>
          <Chip
            color="primary"
            label={currency(resumen.total)}
            sx={{ fontSize: { xs: 10, md: 12 } }}
          />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
          <Chip
            label={`Confirmado: ${currency(resumen.ok)}`}
            color="success"
            size="small"
            sx={{ fontSize: { xs: 10, md: 12 } }}
          />
          <Chip
            label={`Pendiente: ${currency(resumen.pend)}`}
            color="warning"
            size="small"
            sx={{ fontSize: { xs: 10, md: 12 } }}
          />
          <Chip
            label={`Rechazado: ${currency(resumen.bad)}`}
            color="error"
            size="small"
            sx={{ fontSize: { xs: 10, md: 12 } }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
