// src/components/TaeTeDaMas/TermsDialogTC.tsx
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { TAE } from "./constants";

export type TerminosPrograma = {
  titulo: string;
  secciones: { titulo: string; texto: string[] }[];
};

type Props = {
  open: boolean;
  terminos: TerminosPrograma;
  aceptaTC: boolean;
  onChangeAcepta: (value: boolean) => void;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function TermsDialogTC({
  open,
  terminos,
  aceptaTC,
  onChangeAcepta,
  loading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 900,
          bgcolor: `${TAE.blue}08`,
          fontSize: { xs: 14, md: 18 },
        }}
      >
        {terminos.titulo}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          maxHeight: { xs: 380, md: 500 },
          "& p": { mb: 0.5 },
        }}
      >
        <Stack spacing={1.5}>
          {terminos.secciones.map((sec, idx) => (
            <Box key={idx}>
              <Typography
                fontWeight={700}
                gutterBottom
                sx={{ fontSize: { xs: 12, md: 14 } }}
              >
                {sec.titulo}
              </Typography>
              {sec.texto.map((t, i) => (
                <Typography
                  key={i}
                  color="text.secondary"
                  sx={{ fontSize: { xs: 11, md: 13 } }}
                >
                  {t}
                </Typography>
              ))}
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={aceptaTC}
                onChange={(e) => onChangeAcepta(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography sx={{ fontSize: { xs: 11, md: 13 } }}>
                He leído y acepto los términos y condiciones del programa
              </Typography>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ fontSize: { xs: 11, md: 13 } }}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!aceptaTC || loading}
          variant="contained"
          startIcon={
            loading ? <CircularProgress size={16} /> : <WorkspacePremiumIcon />
          }
          sx={{ fontSize: { xs: 11, md: 13 } }}
        >
          {loading ? "Generando…" : "Aceptar y generar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
