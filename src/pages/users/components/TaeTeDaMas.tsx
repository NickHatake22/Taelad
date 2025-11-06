// src/pages/TaeTeDaMas.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Grid, Card, CardContent, Typography, Stack, Chip, Button, Box,
  Divider, Snackbar, Alert, IconButton, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Pagination,
  TextField
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PercentIcon from "@mui/icons-material/Percent";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import HistoryIcon from "@mui/icons-material/History";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import Page from "./Page";
import { usersApi, referidosApi, type Ganancia, type RetiroGanancia } from "../../../services/api";

// Perks
const perks = [
  { icon: <WorkspacePremiumIcon />, titulo: "Referidos TAE", desc: "Gana comisiones por recomendar nuestros sistemas.", tag: "Nuevo" },
  { icon: <PercentIcon />, titulo: "Descuentos por volumen", desc: "Mejor precio al contratar más módulos.", tag: "Próximamente" },
  { icon: <HeadsetMicIcon />, titulo: "Soporte prioritario", desc: "Atención preferente para planes anuales.", tag: "Prioridad" },
];

// Paleta
const TAE = { blue: "#0B57D0", orange: "#FF6A00", black: "#0f1115", white: "#ffffff" };

// URLs EXACTAS
const URLS_BASE = {
  MTLMX: "https://mitiendaenlineamx.com.mx/login-register",
  TAECONTA: "https://www.taeconta.com/autenticacion/crear-cuenta",
  RECHARGES: "https://telorecargo.com/loginmui",
  TAE_HOME: typeof window !== "undefined" ? window.location.origin : "https://taeconta.com",
};

// helper ?ref=
function linkWithRef(baseUrl: string, ref?: string | null) {
  try {
    const u = new URL(baseUrl);
    if (ref) u.searchParams.set("ref", ref);
    return u.toString();
  } catch {
    if (!ref) return baseUrl;
    return baseUrl.includes("?") ? `${baseUrl}&ref=${encodeURIComponent(ref)}` : `${baseUrl}?ref=${encodeURIComponent(ref)}`;
  }
}

// utils
function currency(n: string | number | null | undefined) {
  const v = typeof n === "string" ? parseFloat(n || "0") : (n ?? 0);
  return Number.isFinite(v) ? v.toLocaleString("es-MX", { style: "currency", currency: "MXN" }) : "$0.00";
}
function pct(n: string | number | null | undefined) {
  const v = typeof n === "string" ? parseFloat(n || "0") : (n ?? 0);
  return `${(Number.isFinite(v) ? v : 0).toFixed(2)}%`;
}
function fmtDate(d?: string | null) {
  return d ? d.slice(0, 10) : "—";
}
function yyyymm(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthKeyFromStr(s?: string | null) {
  if (!s) return "";
  const date = new Date(s);
  if (isNaN(+date)) return (s || "").slice(0, 7);
  return yyyymm(date);
}
function daysBetween(from?: string | null) {
  if (!from) return Infinity;
  const d1 = new Date(from);
  if (isNaN(+d1)) return Infinity;
  const now = new Date();
  const ms = now.getTime() - d1.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// Status sets (incluye variantes comunes)
const STATUS_OK = new Set(["pagada", "pagado", "confirmada", "confirmado", "aprobada", "aprobado"]);
const STATUS_BAD = new Set(["rechazada", "rechazado", "cancelada", "cancelado"]);
const isOk = (s?: string) => STATUS_OK.has(String(s || "").toLowerCase().trim());
const isBad = (s?: string) => STATUS_BAD.has(String(s || "").toLowerCase().trim());
const colorForStatus = (s?: string) => {
  const st = (s || "").toLowerCase().trim();
  if (STATUS_OK.has(st)) return "success";
  if (STATUS_BAD.has(st)) return "error";
  return "warning"; // pendiente / otros
};

// Tipo local con los nuevos campos para comodidad
type GananciaNew = Ganancia & {
  nombre_referido?: string | null;
  nombre_producto?: string | null;
  costo_producto?: number | string | null;
  porcentaje_comision?: number | string | null;
  fecha_registro?: string | null;
  fecha_pago?: string | null;
  created_at?: string | null;
};

export default function TaeTeDaMas() {
  const [me, setMe] = useState<{ id: number; name: string; codigo_ref?: string | null } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [codigo, setCodigo] = useState<string | null>(null);

  // Filtro por mes (detalles)
  const currentMonth = useMemo(() => yyyymm(new Date()), []);
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth);

  const links = useMemo(() => ({
    mtlmx: linkWithRef(URLS_BASE.MTLMX, codigo),
    taeconta: linkWithRef(URLS_BASE.TAECONTA, codigo),
    telorecargo: linkWithRef(URLS_BASE.RECHARGES, codigo),
    home: linkWithRef(URLS_BASE.TAE_HOME, codigo),
  }), [codigo]);

  const promoMsg = useMemo(() => ([
    "💙🧡 TAE te da más",
    "",
    "¡Increíbles promociones en nuestros sistemas! 🚀",
    "• MiTiendaEnLineaMX (POS + Tienda): " + links.mtlmx,
    "• TAEConta (Contabilidad + CFDI): " + links.taeconta,
    "• TeLoRecargo (Tiempo aire): " + links.telorecargo,
    "• Plataforma TAE: " + links.home,
    "",
    "Beneficios: comisiones por altas y compras, bonos por volumen, soporte prioritario y promos exclusivas. 🎁",
    "",
    "¿Listo para ganar más con TAE? 😉",
  ].join("\n")), [links]);

  const [openTC, setOpenTC] = useState(false);
  const [aceptaTC, setAceptaTC] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  const [ganancias, setGanancias] = useState<GananciaNew[]>([]);
  const [retiros, setRetiros] = useState<RetiroGanancia[]>([]);
  const [pagG, setPagG] = useState({ page: 1, last: 1, per_page: 10 });
  const [pagR, setPagR] = useState({ page: 1, last: 1, per_page: 10 });
  const [loadingTablas, setLoadingTablas] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; msg: string; sev: "success" | "info" | "warning" | "error" }>({ open: false, msg: "", sev: "success" });

  // usuario
  useEffect(() => {
    (async () => {
      try {
        const { data } = await usersApi.getMe();
        const user = (data?.data || data) as any;
        setMe({ id: user.id, name: user.name, codigo_ref: user.codigo_ref });
        setCodigo(user.codigo_ref || null);
      } catch {
        setToast({ open: true, msg: "No se pudo cargar el usuario", sev: "error" });
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  // fetch
  const fetchHistoriales = async (pageG = pagG.page, pageR = pagR.page) => {
    if (!me?.id) return;
    setLoadingTablas(true);
    try {
      const [g, r] = await Promise.all([
        referidosApi.verGanancias({ user_id: me.id, per_page: pagG.per_page, page: pageG }),
        referidosApi.verRetiros({ user_id: me.id, per_page: pagR.per_page, page: pageR }),
      ]);
      const gd = (g.data?.data || []) as GananciaNew[];
      const rd = (r.data?.data || []) as RetiroGanancia[];
      setGanancias(gd);
      setRetiros(rd);
      setPagG((p) => ({ ...p, page: (g.data?.pagination?.current_page ?? 1), last: (g.data?.pagination?.last_page ?? 1) }));
      setPagR((p) => ({ ...p, page: (r.data?.pagination?.current_page ?? 1), last: (r.data?.pagination?.last_page ?? 1) }));
    } catch {
      setToast({ open: true, msg: "No se pudieron cargar los historiales", sev: "error" });
    } finally {
      setLoadingTablas(false);
    }
  };

  useEffect(() => {
    if (me?.id) fetchHistoriales(1, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  // 🔔 ACTUALIZAR EN VIVO
  useEffect(() => {
    const handler = () => fetchHistoriales(pagG.page, pagR.page);
    window.addEventListener("auth:user-changed", handler as EventListener);
    return () => window.removeEventListener("auth:user-changed", handler as EventListener);
  }, [pagG.page, pagR.page, me?.id]);

  const copy = async (text: string, label = "Copiado") => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ open: true, msg: label, sev: "success" });
    } catch {
      setToast({ open: true, msg: "No se pudo copiar", sev: "error" });
    }
  };

  const onGenerar = () => { setAceptaTC(false); setOpenTC(true); };
  const confirmarGenerar = async () => {
    if (!me?.id) return;
    setGenLoading(true);
    try {
      const r = await referidosApi.asignarCodigo(me.id);
      const nuevo = r.data?.codigo_ref || r.data?.data?.codigo_ref;
      setCodigo(nuevo);
      setToast({ open: true, msg: "¡Código generado!", sev: "success" });
      setOpenTC(false);
    } catch (e: any) {
      setToast({ open: true, msg: e?.response?.data?.message || "No se pudo generar el código", sev: "error" });
    } finally {
      setGenLoading(false);
    }
  };

  // compartir
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(promoMsg)}`, "_blank", "noopener,noreferrer");
  const shareFacebook = () =>
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(links.mtlmx)}&quote=${encodeURIComponent(promoMsg)}`, "_blank", "noopener,noreferrer");

  // Filtrado por mes
  const currentMonthKey = currentMonth;
  const isCurrentMonth = (g: GananciaNew) =>
    monthKeyFromStr(g.fecha_registro || g.created_at) === currentMonthKey;

  const isSelectedMonth = (g: GananciaNew) =>
    monthKeyFromStr(g.fecha_registro || g.created_at) === (monthFilter || currentMonthKey);

  // Pending > 14 días
  const isPendingOld = (g: GananciaNew) => {
    const st = (g.status || "").toLowerCase().trim();
    if (isOk(st) || isBad(st)) return false;
    const d = daysBetween(g.fecha_registro || g.created_at);
    return d > 14;
  };

  // Resumen basado en lo que se muestra en la tabla breve (mes actual)
  const gananciasMesActual = useMemo(() => ganancias.filter(isCurrentMonth), [ganancias]);
  const resumen = useMemo(() => {
    const toNumber = (x: any) => (typeof x === "string" ? parseFloat(x || "0") : (x ?? 0));
    let ok = 0, pend = 0, bad = 0, total = 0;
    for (const g of gananciasMesActual) {
      const st = String(g.status || "").toLowerCase().trim();
      const m = toNumber(g.monto);
      if (STATUS_OK.has(st)) ok += m;
      else if (STATUS_BAD.has(st)) bad += m;
      else pend += m;
      total += m;
    }
    return { ok, pend, bad, total };
  }, [gananciasMesActual]);

  return (
    <Page title="TAE te da más">
      {/* Hero */}
      <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: `linear-gradient(135deg, ${TAE.blue} 0%, ${TAE.orange} 100%)`, color: TAE.white }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={900}>Programa de Referidos TAE</Typography>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>“TAE te da más”: promociones, comisiones y beneficios en nuestros sistemas.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {!codigo ? (
              <Button onClick={onGenerar} variant="contained" sx={{ bgcolor: TAE.black }}>Generar mi código</Button>
            ) : (
              <Button startIcon={<AssignmentTurnedInIcon />} variant="contained" sx={{ bgcolor: TAE.black }}>Código activo</Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Perks */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        {perks.map((p, idx) => (
          <Grid key={idx} item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  {p.icon}
                  <Typography variant="h6" fontWeight={800}>{p.titulo}</Typography>
                  <Chip size="small" label={p.tag} color="primary" />
                </Stack>
                <Typography variant="body2" color="text.secondary">{p.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Código + Acciones */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} md={5}>
          <Card sx={{ border: `1px solid ${TAE.blue}22` }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" color="text.secondary">Tu código de referido</Typography>
                {loadingUser ? (
                  <Stack direction="row" alignItems="center" spacing={1}><CircularProgress size={18} /> <Typography>Cargando…</Typography></Stack>
                ) : codigo ? (
                  <>
                    <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: 2 }}>{codigo}</Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button startIcon={<ContentCopyIcon />} onClick={() => copy(codigo!, "Código copiado")} variant="outlined">Copiar código</Button>
                      <Button startIcon={<WhatsAppIcon />} onClick={shareWhatsApp} variant="contained" sx={{ bgcolor: "#25D366" }}>WhatsApp</Button>
                      <Button startIcon={<FacebookIcon />} onClick={shareFacebook} variant="contained" sx={{ bgcolor: "#1877F2" }}>Facebook</Button>
                    </Stack>

                    {/* Enlaces ocultos como BOTONES por marca */}
                    <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: `${TAE.blue}0F`, border: `1px dashed ${TAE.blue}55`, mt: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, display: "flex", alignItems: "center", gap: .5 }}>
                        <LinkIcon fontSize="small" /> Enlaces con tu <b>ref</b>
                      </Typography>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        {/* MiTiendaEnLineaMX — amarillo */}
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Button
                            variant="contained"
                            onClick={() => window.open(links.mtlmx, "_blank", "noopener,noreferrer")}
                            sx={{ bgcolor: "#FFC107", color: "#111", "&:hover": { bgcolor: "#FFB300" }, whiteSpace: "nowrap" }}
                          >
                            MiTiendaEnLineaMX
                          </Button>
                          <Tooltip title="Copiar enlace">
                            <IconButton size="small" onClick={() => copy(links.mtlmx, "Link MiTienda copiado")}>
                              <ContentCopyIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        {/* TAEConta — naranja */}
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Button
                            variant="contained"
                            onClick={() => window.open(links.taeconta, "_blank", "noopener,noreferrer")}
                            sx={{ bgcolor: "#FF6A00", color: "#fff", "&:hover": { bgcolor: "#E65E00" }, whiteSpace: "nowrap" }}
                          >
                            TAEConta
                          </Button>
                          <Tooltip title="Copiar enlace">
                            <IconButton size="small" onClick={() => copy(links.taeconta, "Link TAEConta copiado")}>
                              <ContentCopyIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        {/* TeLoRecargo — azul */}
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Button
                            variant="contained"
                            onClick={() => window.open(links.telorecargo, "_blank", "noopener,noreferrer")}
                            sx={{ bgcolor: "#0B57D0", color: "#fff", "&:hover": { bgcolor: "#0A49AF" }, whiteSpace: "nowrap" }}
                          >
                            TeLoRecargo
                          </Button>
                          <Tooltip title="Copiar enlace">
                            <IconButton size="small" onClick={() => copy(links.telorecargo, "Link TeLoRecargo copiado")}>
                              <ContentCopyIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Usa los botones para <b>abrir</b> o el ícono para <b>copiar</b> tu enlace con código.
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary">Aún no tienes un código de referido.</Typography>
                    <Button onClick={onGenerar} variant="contained">Crear mi código ahora</Button>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Total (mes actual) */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight={800}>Total de Ganancias (mes actual)</Typography>
                <Chip color="primary" label={currency(resumen.total)} />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                <Chip label={`Confirmado: ${currency(resumen.ok)}`} color="success" size="small" />
                <Chip label={`Pendiente: ${currency(resumen.pend)}`} color="warning" size="small" />
                <Chip label={`Rechazado: ${currency(resumen.bad)}`} color="error" size="small" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Historial breve (SOLO mes actual) */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MonetizationOnIcon />
                  <Typography variant="h6" fontWeight={800}>Ganancias (Mes Actual)</Typography>
                </Stack>
                <Tooltip title="Recargar">
                  <span>
                    <IconButton onClick={() => fetchHistoriales(pagG.page, pagR.page)} disabled={loadingTablas}><HistoryIcon /></IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <Divider sx={{ mb: 1 }} />
              <TableContainer component={Paper} sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Sistema</TableCell>
                      <TableCell>Concepto</TableCell>
                      <TableCell align="right">Monto</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingTablas ? (
                      <TableRow><TableCell colSpan={5}><Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={16} />Cargando…</Stack></TableCell></TableRow>
                    ) : gananciasMesActual.length === 0 ? (
                      <TableRow><TableCell colSpan={5}>Sin registros</TableCell></TableRow>
                    ) : (
                      gananciasMesActual.map((g) => {
                        const oldPend = isPendingOld(g);
                        return (
                          <TableRow
                            key={g.id}
                            sx={oldPend ? { bgcolor: "#ffebee" /* rojo muy clarito */ } : undefined}
                          >
                            <TableCell>{fmtDate(g.fecha_registro || g.created_at)}</TableCell>
                            <TableCell>{g.sistema || "—"}</TableCell>
                            <TableCell>{g.nombre_producto || (g as any).producto_nombre || (g as any).origen || "—"}</TableCell>
                            <TableCell align="right">{currency(g.monto)}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={g.status}
                                color={colorForStatus(g.status)}
                                variant={oldPend ? "outlined" : "filled"}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                <Pagination
                  page={pagG.page}
                  count={pagG.last}
                  size="small"
                  onChange={(_, p) => { setPagG((x) => ({ ...x, page: p })); fetchHistoriales(p, pagR.page); }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🧾 Tabla APARTE: Ganancias (detalle) con filtro por MES */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 1 }} spacing={1}>
            <Typography variant="h6" fontWeight={800}>Mas Detalles de tus Ganancias</Typography>
            <TextField
              label="Mes"
              type="month"
              size="small"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              inputProps={{ max: yyyymm(new Date()) }}
            />
          </Stack>
          <Divider sx={{ mb: 1 }} />

          <TableContainer component={Paper} sx={{ maxHeight: 420 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha registro</TableCell>
                  <TableCell>Referido</TableCell>
                  <TableCell>Sistema</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Costo</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">% Comisión</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Fecha pago</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTablas ? (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={16} />Cargando…</Stack>
                    </TableCell>
                  </TableRow>
                ) : ganancias.filter(isSelectedMonth).length === 0 ? (
                  <TableRow><TableCell colSpan={10}>Sin registros</TableCell></TableRow>
                ) : (
                  ganancias.filter(isSelectedMonth).map((g) => {
                    const oldPend = isPendingOld(g);
                    return (
                      <TableRow
                        key={g.id}
                        sx={oldPend ? { bgcolor: "#ffebee" } : undefined}
                      >
                        <TableCell>{fmtDate(g.fecha_registro || g.created_at)}</TableCell>
                        <TableCell>{g.nombre_referido || "—"}</TableCell>
                        <TableCell>{g.sistema || "—"}</TableCell>
                        <TableCell>{g.nombre_producto || (g as any).producto_nombre || (g as any).origen || "—"}</TableCell>
                        <TableCell align="right">{currency(g.costo_producto)}</TableCell>
                        <TableCell>{g.tipo || "—"}</TableCell>
                        <TableCell align="right">{pct(g.porcentaje_comision)}</TableCell>
                        <TableCell align="right">{currency(g.monto)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={g.status}
                            color={colorForStatus(g.status)}
                            variant={oldPend ? "outlined" : "filled"}
                          />
                        </TableCell>
                        <TableCell>{fmtDate(g.fecha_pago)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Retiros */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <HistoryIcon />
            <Typography variant="h6" fontWeight={800}>Historial de retiros</Typography>
          </Stack>
          <Divider sx={{ mb: 1 }} />
          <TableContainer component={Paper} sx={{ maxHeight: 360 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell>Referencia</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTablas ? (
                  <TableRow><TableCell colSpan={5}><Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={16} />Cargando…</Stack></TableCell></TableRow>
                ) : retiros.length === 0 ? (
                  <TableRow><TableCell colSpan={5}>Sin registros</TableCell></TableRow>
                ) : (
                  retiros.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{fmtDate(r.created_at)}</TableCell>
                      <TableCell>{r.metodo}</TableCell>
                      <TableCell>{r.referencia_pago || "—"}</TableCell>
                      <TableCell align="right">{currency(r.monto)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={r.status} color={colorForStatus(r.status)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
            <Pagination
              page={pagR.page}
              count={pagR.last}
              size="small"
              onChange={(_, p) => { setPagR((x) => ({ ...x, page: p })); fetchHistoriales(pagG.page, p); }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* T&C */}
      <Dialog open={openTC} onClose={() => setOpenTC(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, bgcolor: `${TAE.blue}08` }}>Términos y condiciones del programa</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25} sx={{ "& li": { mb: 0.5 } }}>
            <Typography variant="body2" color="text.secondary">
              Para generar tu código de referido debes aceptar los siguientes términos provisionales:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li><Typography variant="body2"><b>Elegibilidad:</b> Cuenta activa sin adeudos y aprobación de TAE.</Typography></li>
              <li><Typography variant="body2"><b>Validación de comisiones:</b> Se confirman tras verificar pago y sin reembolsos/cancelaciones.</Typography></li>
              <li><Typography variant="body2"><b>Fraude o mal uso:</b> Spam o incentivos engañosos pueden cancelar el código.</Typography></li>
              <li><Typography variant="body2"><b>Tiempos de pago:</b> Retiros de 3 a 7 días hábiles después de aprobados.</Typography></li>
              <li><Typography variant="body2"><b>Modificaciones:</b> TAE puede ajustar reglas/porcentajes con aviso en plataforma.</Typography></li>
            </Box>
            <FormControlLabel control={<Checkbox checked={aceptaTC} onChange={(e) => setAceptaTC(e.target.checked)} />} label="He leído y acepto los términos y condiciones" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTC(false)}>Cancelar</Button>
          <Button onClick={confirmarGenerar} disabled={!aceptaTC || genLoading} variant="contained" startIcon={genLoading ? <CircularProgress size={16} /> : <WorkspacePremiumIcon />}>
            {genLoading ? "Generando…" : "Aceptar y generar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={2800} onClose={() => setToast((t) => ({ ...t, open: false }))}>
        <Alert severity={toast.sev} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Page>
  );
}
