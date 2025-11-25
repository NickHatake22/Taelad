// src/components/TaeTeDaMas/ReferralCodeCard.tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkIcon from "@mui/icons-material/Link";
import { currency } from "./utils";
import { TAE } from "./constants";

type Links = {
  mtlmx: string;
  taeconta: string;
  telorecargo: string;
  home: string;
};

type Props = {
  loadingUser: boolean;
  codigo: string | null;
  saldoTotalConfirmado: number;
  links: Links;
  onCopy: (text: string, label?: string) => void;
  onShareWhatsApp: () => void;
  onShareFacebook: () => void;
};

export function ReferralCodeCard({
  loadingUser,
  codigo,
  saldoTotalConfirmado,
  links,
  onCopy,
  onShareWhatsApp,
  onShareFacebook,
}: Props) {
  const hasCode = !!codigo;

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: `1px solid ${TAE.blue}22`,
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
      }}
    >
      <CardContent sx={{ p: { xs: 1.75, md: 2.25 } }}>
        <Stack spacing={1.75}>
          {/* 🔹 Encabezado */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 11, md: 12 },
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                Programa de referidos
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 15, md: 18 },
                  fontWeight: 800,
                }}
              >
                Tu código y saldo de comisiones
              </Typography>
            </Box>

            {hasCode && (
              <Chip
                size="small"
                label="Activo"
                color="success"
                sx={{
                  fontSize: { xs: 10, md: 11 },
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>

          {/* 🔹 Estado de carga / sin código */}
          {loadingUser ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress size={18} />
              <Typography sx={{ fontSize: { xs: 11, md: 13 } }}>
                Cargando datos de tu cuenta…
              </Typography>
            </Stack>
          ) : !hasCode ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "background.default",
                border: "1px dashed rgba(0,0,0,0.1)",
              }}
            >
              <Typography>
                
              </Typography>
          
              <Typography sx={{ fontSize: { xs: 11, md: 13 }, mb: 0.5 }}>
                Aún no tienes un código de referido activo.
              </Typography>
              <Typography
                sx={{ fontSize: { xs: 11, md: 12 }, color: "text.secondary" }}
              >
                Genera tu código en la parte superior de esta pantalla para
                comenzar a compartir y ganar comisiones.
              </Typography>
            </Box>
          ) : (
            <>
              {/* 🔹 Código + Saldo como stats */}
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={7}>
                  <Box
                    sx={{
                      px: { xs: 1.5, md: 2 },
                      py: { xs: 1, md: 1.25 },
                      borderRadius: 2,
                      bgcolor: `${TAE.blue}10`,
                      border: `1px solid ${TAE.blue}55`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.5,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: { xs: 11, md: 12 },
                          color: "text.secondary",
                          mb: 0.25,
                        }}
                      >
                        Código de referido
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          letterSpacing: 2,
                          fontSize: { xs: 22, md: 28 },
                          wordBreak: "break-word",
                        }}
                      >
                        {codigo}
                      </Typography>
                    </Box>
                    <Tooltip title="Copiar código">
                      <IconButton
                        size="small"
                        onClick={() => onCopy(codigo, "Código copiado")}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={5}>
                  <Box
                    sx={{
                      px: { xs: 1.5, md: 2 },
                      py: { xs: 1, md: 1.25 },
                      borderRadius: 2,
                      bgcolor: "success.main",
                      color: "#fff",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      minHeight: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: 11, md: 12 },
                        opacity: 0.9,
                        mb: 0.25,
                      }}
                    >
                      Saldo total en comisiones
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: 22, md: 26 },
                        lineHeight: 1.1,
                      }}
                    >
                      {currency(saldoTotalConfirmado)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: 10, md: 11 },
                        opacity: 0.9,
                        mt: 0.25,
                      }}
                    >
                      Monto confirmado disponible para retiro.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* 🔹 Acciones rápidas */}
              <Box sx={{ mt: 1.5 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 11, md: 12 },
                    color: "text.secondary",
                    mb: 0.75,
                  }}
                >
                  Acciones rápidas
                </Typography>

                <Grid container spacing={1}>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => onCopy(codigo, "Código copiado")}
                      sx={{ fontSize: { xs: 11, md: 13 } }}
                    >
                      Copiar código
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<WhatsAppIcon />}
                      onClick={onShareWhatsApp}
                      sx={{
                        fontSize: { xs: 11, md: 13 },
                        bgcolor: "#25D366",
                        "&:hover": { bgcolor: "#1EB75A" },
                      }}
                    >
                      Compartir WhatsApp
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<FacebookIcon />}
                      onClick={onShareFacebook}
                      sx={{
                        fontSize: { xs: 11, md: 13 },
                        bgcolor: "#1877F2",
                        "&:hover": { bgcolor: "#145FCC" },
                      }}
                    >
                      Compartir Facebook
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 1.75 }} />

              {/* 🔹 Enlaces con ref */}
              <Box>
                <Typography
                  sx={{
                    mb: 0.75,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    fontSize: { xs: 11, md: 13 },
                  }}
                >
                  <LinkIcon fontSize="small" />
                  Enlaces listos para compartir
                </Typography>

                <Stack
                  spacing={0.75}
                  sx={{
                    width: "100%",
                    maxWidth: { xs: 260, md: 320 }, // ajusta a tu gusto
                    mx: "auto",                      // centra el bloque
                  }}
                >
                  {/* MiTienda */}
                  <RowLink
                    label="MiTiendaEnLineaMX"
                    color="#FFC107"
                    textColor="#111"
                    url={links.mtlmx}
                    onCopy={() =>
                      onCopy(links.mtlmx, "Link MiTienda copiado")
                    }
                  />

                  {/* TAEConta */}
                  <RowLink
                    label="TAEConta"
                    color="#FF6A00"
                    textColor="#fff"
                    url={links.taeconta}
                    onCopy={() =>
                      onCopy(links.taeconta, "Link TAEConta copiado")
                    }
                  />

                  {/* TeLoRecargo */}
                  <RowLink
                    label="TeLoRecargo"
                    color="#0B57D0"
                    textColor="#fff"
                    url={links.telorecargo}
                    onCopy={() =>
                      onCopy(
                        links.telorecargo,
                        "Link TeLoRecargo copiado"
                      )
                    }
                  />
                </Stack>

                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: 0.75, fontSize: { xs: 10, md: 11 } }}
                >
                  Usa los botones para <b>abrir</b> el sistema o el ícono para{" "}
                  <b>copiar</b> tu enlace con código de referido.
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

/** 🔹 Fila reutilizable para cada enlace */
type RowLinkProps = {
  label: string;
  color: string;
  textColor: string;
  url: string;
  onCopy: () => void;
};

function RowLink({ label, color, textColor, url, onCopy }: RowLinkProps) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      sx={{ width: "100%" }}
    >
      <Button
        variant="contained"
        onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
        sx={{
          bgcolor: color,
          color: textColor,
          "&:hover": { bgcolor: color },
          flexGrow: 1,
          justifyContent: "flex-start",
          fontSize: { xs: 10, md: 12 },
          textTransform: "none",
        }}
      >
        {label}
      </Button>
      <Tooltip title="Copiar enlace">
        <IconButton size="small" onClick={onCopy}>
          <ContentCopyIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
