// src/components/TaeTeDaMas/SistemaChip.tsx
import { Chip, Typography } from "@mui/material";

type Props = {
  value?: string | null;
};

export function SistemaChip({ value }: Props) {
  const SISTEMAS_CHIP: Record<
    string,
    { label: string; bg: string; color: string }
  > = {
    mtelmx: {
      label: "MiTiendaEnLineaMX",
      bg: "#FFC107",
      color: "#111",
    },
    taeconta: {
      label: "TAEConta",
      bg: "#FF6A00",
      color: "#ffffff",
    },
    telorecargo: {
      label: "TeLoRecargo",
      bg: "#0B57D0",
      color: "#ffffff",
    },
    tae: {
      label: "TAE",
      bg: "#0B57D0",
      color: "#ffffff",
    },
  };

  const key = (value || "").toLowerCase().trim();
  const config = SISTEMAS_CHIP[key];

  if (!config) {
    return (
      <Typography sx={{ fontSize: { xs: 11, md: 12 } }}>
        {value || "—"}
      </Typography>
    );
  }

  return (
    <Chip
      size="small"
      label={config.label}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        textTransform: "none",
        fontSize: { xs: 10, md: 11 },
      }}
    />
  );
}
