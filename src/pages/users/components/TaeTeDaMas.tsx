// src/pages/TaeTeDaMas.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, Snackbar, Alert } from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PercentIcon from "@mui/icons-material/Percent";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import Page from "./Page";
import { usersApi, referidosApi } from "../../../services/api";

import terminosJson from "../../../content/referidos_tyc.json";

import { HeroSection } from "../../../components/TaeTeDaMas/HeroSection";
import { PerksSection, type Perk } from "../../../components/TaeTeDaMas/PerksSection";
import { ReferralCodeCard } from "../../../components/TaeTeDaMas/ReferralCodeCard";
import {
  MonthlySummaryCard,
  type ResumenGanancias,
} from "../../../components/TaeTeDaMas/MonthlySummaryCard";
import { CurrentMonthTable } from "../../../components/TaeTeDaMas/CurrentMonthTable";
import { MonthlyDetailTable } from "../../../components/TaeTeDaMas/MonthlyDetailTable";
import { WithdrawalsTable } from "../../../components/TaeTeDaMas/WithdrawalsTable";
import {
  TermsDialogTC,
  type TerminosPrograma,
} from "../../../components/TaeTeDaMas/TermsDialogTC";

import {
  toNumber,
  yyyymm,
  monthKeyFromStr,
  daysBetween,
  isOk,
  isBad,
} from "../../../components/TaeTeDaMas/utils";

// -------------------- Tipos locales UI --------------------
type GananciaUI = {
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
  fecha_pago?: string | null;
  created_at?: string | null;
  [key: string]: any;
};

type RetiroUI = {
  id: number | string;
  created_at?: string | null;
  metodo?: string | null;
  referencia_pago?: string | null;
  monto: number | string | null;
  status?: string | null;
  [key: string]: any;
};

type ToastState = {
  open: boolean;
  msg: string;
  sev: "success" | "info" | "warning" | "error";
};

// -------------------- Helper link ?ref= --------------------
function linkWithRef(baseUrl: string, ref?: string | null) {
  try {
    const u = new URL(baseUrl);
    if (ref) u.searchParams.set("ref", ref);
    return u.toString();
  } catch {
    if (!ref) return baseUrl;
    return baseUrl.includes("?")
      ? `${baseUrl}&ref=${encodeURIComponent(ref)}`
      : `${baseUrl}?ref=${encodeURIComponent(ref)}`;
  }
}

// -------------------- URLs base --------------------
const URLS_BASE = {
  MTLMX: "https://mitiendaenlineamx.com.mx/login-register",
  TAECONTA: "https://www.taeconta.com/autenticacion/crear-cuenta",
  RECHARGES: "https://telorecargo.com/loginmui",
  TAE_HOME:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://taeconta.com",
};

// -------------------- Perks (tarjetas de arriba) --------------------
const perks: Perk[] = [
  {
    icon: <WorkspacePremiumIcon />,
    titulo: "Referidos TAE",
    desc: "Gana comisiones por recomendar nuestros sistemas.",
    tag: "Nuevo",
  },
  {
    icon: <PercentIcon />,
    titulo: "Descuentos por volumen",
    desc: "Mejor precio al contratar más módulos.",
    tag: "Próximamente",
  },
  {
    icon: <HeadsetMicIcon />,
    titulo: "Soporte prioritario",
    desc: "Atención preferente para planes anuales.",
    tag: "Prioridad",
  },
];

const terminos = terminosJson as TerminosPrograma;

// ======================================================
//                COMPONENTE PRINCIPAL
// ======================================================
export default function TaeTeDaMas() {
  const [me, setMe] = useState<{
    id: number;
    name: string;
    codigo_ref?: string | null;
  } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [codigo, setCodigo] = useState<string | null>(null);

  const currentMonth = useMemo(() => yyyymm(new Date()), []);
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth);

  const [ganancias, setGanancias] = useState<GananciaUI[]>([]);
  const [retiros, setRetiros] = useState<RetiroUI[]>([]);
  const [pagG, setPagG] = useState({ page: 1, last: 1, per_page: 5000 });
  const [pagR, setPagR] = useState({ page: 1, last: 1, per_page: 5000 });
  const [loadingTablas, setLoadingTablas] = useState(false);

  const [saldoTotalConfirmado, setSaldoTotalConfirmado] = useState(0);

  const [openTC, setOpenTC] = useState(false);
  const [aceptaTC, setAceptaTC] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    msg: "",
    sev: "success",
  });

  // -------------------- Links con ref --------------------
  const links = useMemo(
    () => ({
      mtlmx: linkWithRef(URLS_BASE.MTLMX, codigo),
      taeconta: linkWithRef(URLS_BASE.TAECONTA, codigo),
      telorecargo: linkWithRef(URLS_BASE.RECHARGES, codigo),
      home: linkWithRef(URLS_BASE.TAE_HOME, codigo),
    }),
    [codigo]
  );

  // -------------------- Mensaje promo general --------------------
  const promoMsg = useMemo(
    () =>
      [
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
      ].join("\n"),
    [links]
  );

  // -------------------- Cargar usuario --------------------
  useEffect(() => {
    (async () => {
      try {
        const { data } = await usersApi.getMe();
        const user = (data?.data || data) as any;
        setMe({ id: user.id, name: user.name, codigo_ref: user.codigo_ref });
        setCodigo(user.codigo_ref || null);
      } catch (e) {
        setToast({
          open: true,
          msg: "No se pudo cargar el usuario",
          sev: "error",
        });
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  // -------------------- Fetch historiales --------------------
  const fetchHistoriales = async (pageG = 1, pageR = 1) => {
    if (!me?.id) return;
    setLoadingTablas(true);
    try {
      const [g, r] = await Promise.all([
        referidosApi.verGanancias({
          user_id: me.id,
          per_page: pagG.per_page,
          page: pageG,
        }),
        referidosApi.verRetiros({
          user_id: me.id,
          per_page: pagR.per_page,
          page: pageR,
        }),
      ]);

      const gd = (g.data?.data || []) as GananciaUI[];
      const rd = (r.data?.data || []) as RetiroUI[];

      setGanancias(gd);
      setRetiros(rd);

      let totalConfirmado = 0;
      for (const item of gd) {
        if (isOk(item.status)) {
          totalConfirmado += toNumber(item.monto);
        }
      }
      setSaldoTotalConfirmado(totalConfirmado);

      setPagG((p) => ({
        ...p,
        page: g.data?.pagination?.current_page ?? 1,
        last: g.data?.pagination?.last_page ?? 1,
      }));
      setPagR((p) => ({
        ...p,
        page: r.data?.pagination?.current_page ?? 1,
        last: r.data?.pagination?.last_page ?? 1,
      }));
    } catch (err) {
      setToast({
        open: true,
        msg: "No se pudieron cargar los historiales",
        sev: "error",
      });
    } finally {
      setLoadingTablas(false);
    }
  };

  useEffect(() => {
    if (me?.id) fetchHistoriales(1, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  useEffect(() => {
    const handler = () => {
      fetchHistoriales(1, 1);
    };
    window.addEventListener("auth:user-changed", handler as EventListener);
    return () =>
      window.removeEventListener("auth:user-changed", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  // -------------------- Helpers UI --------------------
  const copy = async (text: string, label = "Copiado") => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ open: true, msg: label, sev: "success" });
    } catch {
      setToast({ open: true, msg: "No se pudo copiar", sev: "error" });
    }
  };

  const onGenerar = () => {
    setAceptaTC(false);
    setOpenTC(true);
  };

  const confirmarGenerar = async () => {
    if (!me?.id) return;
    setGenLoading(true);
    try {
      const r = await referidosApi.asignarCodigo(me.id);
      const nuevo = r.data?.codigo_ref || r.data?.data?.codigo_ref;
      setCodigo(nuevo);
      setToast({ open: true, msg: "¡Código generado!", sev: "success" });
      setOpenTC(false);
      fetchHistoriales(1, 1);
    } catch (e: any) {
      setToast({
        open: true,
        msg: e?.response?.data?.message || "No se pudo generar el código",
        sev: "error",
      });
    } finally {
      setGenLoading(false);
    }
  };

  const shareWhatsApp = () =>
    window.open(
      `https://wa.me/?text=${encodeURIComponent(promoMsg)}`,
      "_blank",
      "noopener,noreferrer"
    );

  const shareFacebook = () =>
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        links.mtlmx
      )}&quote=${encodeURIComponent(promoMsg)}`,
      "_blank",
      "noopener,noreferrer"
    );

  const currentMonthKey = currentMonth;
  const isCurrentMonth = (g: GananciaUI) =>
    monthKeyFromStr(g.fecha_registro || g.created_at) === currentMonthKey;
  const isSelectedMonth = (g: GananciaUI) =>
    monthKeyFromStr(g.fecha_registro || g.created_at) ===
    (monthFilter || currentMonthKey);

  const isPendingOld = (g: GananciaUI) => {
    if (isOk(g.status) || isBad(g.status)) return false;
    const d = daysBetween(g.fecha_registro || g.created_at);
    return d > 14;
  };

  const gananciasMesActual = useMemo(
    () => ganancias.filter(isCurrentMonth),
    [ganancias]
  );

  const resumen: ResumenGanancias = useMemo(() => {
    let ok = 0,
      pend = 0,
      bad = 0,
      total = 0;

    for (const g of gananciasMesActual) {
      const st = String(g.status || "").toLowerCase().trim();
      const m = toNumber(g.monto);

      if (isOk(st)) ok += m;
      else if (isBad(st)) bad += m;
      else pend += m;

      total += m;
    }
    return { ok, pend, bad, total };
  }, [gananciasMesActual]);

// -------------------- Render --------------------
return (
  <Page title="TAE te da más">
    {/* Contenedor tipo “teléfono” igual que el Dashboard */}
<Box
  sx={{
    width: "100%",
    mx: "auto",
    maxWidth: {
      xs: 450,   // móvil
      sm: 700,   // tablet
      md: "100%" // escritorio normal
    },
    px: { xs: 1, sm: 1.5, md: 3 },
    pb: 3,
  }}
>

      <HeroSection
        codigo={codigo}
        onGenerar={onGenerar}
        onOpenTerms={() => setOpenTC(true)}
      />

      <PerksSection perks={perks} />

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} md={5}>
          <ReferralCodeCard
            loadingUser={loadingUser}
            codigo={codigo}
            saldoTotalConfirmado={saldoTotalConfirmado}
            links={links}
            onCopy={copy}
            onShareWhatsApp={shareWhatsApp}
            onShareFacebook={shareFacebook}
          />

          {/* <MonthlySummaryCard resumen={resumen} /> */}
        </Grid>

        <Grid item xs={12} md={7}>
          <CurrentMonthTable
            gananciasMesActual={gananciasMesActual}
            loadingTablas={loadingTablas}
            onReload={() => fetchHistoriales(pagG.page, pagR.page)}
            isPendingOld={isPendingOld}
          />
        </Grid>
      </Grid>

      <MonthlyDetailTable
        ganancias={ganancias}
        loadingTablas={loadingTablas}
        monthFilter={monthFilter}
        onMonthChange={setMonthFilter}
        isSelectedMonth={isSelectedMonth}
        isPendingOld={isPendingOld}
      />

      <WithdrawalsTable
        retiros={retiros}
        loadingTablas={loadingTablas}
        page={pagR.page}
        lastPage={pagR.last}
        onChangePage={(p) => {
          setPagR((x) => ({ ...x, page: p }));
          fetchHistoriales(pagG.page, p);
        }}
      />

      <TermsDialogTC
        open={openTC}
        terminos={terminos}
        aceptaTC={aceptaTC}
        onChangeAcepta={setAceptaTC}
        loading={genLoading}
        onClose={() => setOpenTC(false)}
        onConfirm={confirmarGenerar}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() =>
          setToast((t) => ({
            ...t,
            open: false,
          }))
        }
      >
        <Alert
          severity={toast.sev}
          variant="filled"
          onClose={() =>
            setToast((t) => ({
              ...t,
              open: false,
            }))
          }
          sx={{ fontSize: { xs: 11, md: 13 } }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  </Page>
);


}
