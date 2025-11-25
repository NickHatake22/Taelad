// src/components/TaeTeDaMas/HeroSection.tsx
import { Box, Button, Stack, Typography } from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { TAE } from "./constants";

type Props = {
  codigo: string | null;
  onGenerar: () => void;
  onOpenTerms: () => void;
};

export function HeroSection({ codigo, onGenerar, onOpenTerms }: Props) {
  return (
    <Box
      sx={{
        mb: 2,
        p: { xs: 1.25, md: 2 },
        borderRadius: 2,
        background: {
          xs: TAE.blue,
          md: `linear-gradient(135deg, ${TAE.blue} 0%, ${TAE.orange} 100%)`,
        },
        color: TAE.white,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        <Box sx={{ width: { xs: "100%", md: "auto" } }}>
          <Typography
            fontWeight={900}
            sx={{ mb: 0.25, fontSize: { xs: 16, md: 22 } }}
          >
            Programa de Referidos TAE
          </Typography>
          <Typography
            sx={{
              opacity: 0.95,
              fontSize: { xs: 11, md: 14 },
              maxWidth: 420,
            }}
          >
            “TAE te da más”: promociones, comisiones y beneficios en nuestros
            sistemas.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {!codigo ? (
            <Button
              fullWidth
              onClick={onGenerar}
              variant="contained"
              sx={{
                bgcolor: TAE.black,
                width: { xs: "100%", sm: "auto" },
                fontSize: { xs: 11, md: 13 },
              }}
              startIcon={<WorkspacePremiumIcon />}
            >
              Generar mi código
            </Button>
          ) : (
            <Button
              fullWidth
              startIcon={<AssignmentTurnedInIcon />}
              variant="contained"
              sx={{
                bgcolor: TAE.black,
                width: { xs: "100%", sm: "auto" },
                fontSize: { xs: 11, md: 13 },
              }}
            >
              Código activo
            </Button>
          )}

          <Button
            fullWidth
            variant="outlined"
            onClick={onOpenTerms}
            startIcon={<AssignmentTurnedInIcon />}
            sx={{
              width: { xs: "100%", sm: "auto" },
              borderColor: TAE.white,
              color: TAE.white,
              fontSize: { xs: 11, md: 13 },
              "&:hover": {
                borderColor: TAE.white,
                bgcolor: "rgba(255,255,255,0.12)",
              },
            }}
          >
            Ver términos
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
