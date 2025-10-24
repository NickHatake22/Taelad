// src/services/api/index.ts
import axiosClient from "../axiosClient";
import { setAuthToken } from "../axiosClient";

/** =======================
 *  Tipos base
 * ======================= */
export type ApiResponse<T> = {
  ok?: boolean;
  message?: string;
  data?: T;
  [k: string]: any;
};

export type PaginationParams = {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
};

export type User = {
  id: number;
  name: string;
  apellidos?: string | null;
  email: string;
  phone?: string | null;
  ganancias?: string;
  role?: number;
  codigo_ref?: string | null;
  terminos?: boolean;
  temspace?: string | null;
  created_at?: string;
  updated_at?: string;
  profile_photo_url?: string | null;
};

export type Producto = {
  id: number;
  name: string;
  descripcion?: string | null;
  tipo_produc?: string | null;
  precio: string;
  url_imagen?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type HistorialCompra = {
  id: number;
  id_user: number;
  id_producto: number;
  fecha: string;
  cantidad: number;
  created_at?: string;
  updated_at?: string;
};

/** =======================
 *  Tipos Account
 * ======================= */
export type UserFiscalData = {
  id: number;
  user_id: number;
  razon_social?: string | null;
  rfc?: string | null;
  regimen_fiscal?: string | null; // código SAT
  codigo_postal?: string | null;

  // (si ya los quitaste del backend, puedes borrar estos 6 campos)
  csd_cer_path?: string | null;
  csd_key_path?: string | null;
  csd_password?: string | null;
  fiel_cer_path?: string | null;
  fiel_key_path?: string | null;
  fiel_password?: string | null;

  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type UserBusiness = {
  id: number;
  user_id: number;
  business_name?: string | null;
  domain?: string | null;
  website_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SystemKey =
  | "taeconta"
  | "telorecargo"
  | "ticketbusiness"
  | "mitiendaenlinea"
  | "otro";

export type LoginType = "email" | "phone" | "username";

export type UserSystemCredential = {
  id: number;
  user_id: number;
  system: SystemKey;
  login_type: LoginType;
  login_value: string;
  credential_password?: string | null; // servidor lo cifra
  extra?: Record<string, any> | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type UpsertCredentialPayload = {
  system: SystemKey;
  login_type: LoginType;
  login_value: string;
  credential_password?: string;
  extra?: Record<string, any>;
  is_active?: boolean;
};

/** =======================
 *  Tipos Referidos / Ganancias
 * ======================= */
export type GananciaStatus = "pendiente" | "confirmada" | "pagada" | "rechazada";
export type GananciaTipo = "comision" | "bono" | "reversa" | "otro";

/** Refleja tu tabla `ganancias` (captura) */
export type Ganancia = {
  id: number;
  user_id: number;

  // Campos del esquema nuevo
  nombre_referido?: string | null;
  sistema?: string | null;
  nombre_producto?: string | null;
  costo_producto?: string | number | null;
  tipo: GananciaTipo;
  porcentaje_comision?: string | number | null;

  // Compatibilidad hacia atrás
  referido_id?: number | null;
  codigo_referencia?: string | null;
  producto_id?: number | null;
  producto_nombre?: string | null; // fallback
  origen?: string | null;

  // Importes y estado
  monto: string | number;
  status: GananciaStatus;

  // Fechas nuevas
  fecha_registro?: string | null;
  fecha_pago?: string | null;

  // Metadatos
  meta?: any;
  referencia_externa?: string | null;
  fecha_pago_esperada?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

export type RetiroGanancia = {
  id: number;
  user_id: number;
  monto: string;
  metodo: "transferencia" | "paypal" | "oxxo" | "manual" | "otro";
  cuenta_destino?: string | null;
  status: "pendiente" | "procesado" | "rechazado" | "pagado";
  procesado_por?: number | null;
  referencia_pago?: string | null;
  notas?: string | null;
  fecha_procesado?: string | null;
  created_at?: string;
  updated_at?: string;
};

/** =======================
 *  Rutas (constantes)
 * ======================= */
export const API_ROUTES = {
  auth: {
    requestCode: "/auth/request-code",
    verifyCode: "/auth/verify-code",
    register: "/auth/register",
    login: "/auth/login",
    changePassword: "/auth/password/change",
    resetPasswordByCode: "/auth/password/reset",
  },
  users: {
    me: "/user",
  },
  account: {
    profile: "/account/profile",
    password: "/account/password",
    fiscal: "/account/fiscal",
    business: "/account/business",
    credentials: "/account/credentials",
    credentialBySystem: (system: SystemKey) => `/account/credentials/${system}`,
  },
  productos: {
    root: "/productos",
    byId: (id: number | string) => `/productos/${id}`,
  },
  historial: {
    root: "/historial-compras",
    byUser: (userId: number | string) => `/historial-compras?user_id=${userId}`,
  },

  // Rutas previas de "referidos"
  referidos: {
    asignarCodigo: (userId: number | string) => `/referidos/asignar-codigo/${userId}`,
    regenerarCodigo: (userId: number | string) => `/referidos/regenerar-codigo/${userId}`,
    ganancias: "/referidos/ganancias", // <- ya NO la usamos, pero la dejamos
    retiros: "/referidos/retiros",
  },

  // Tus rutas reales de ganancias (resource)
  ganancias: {
    root: "/ganancias",
    byId: (id: number | string) => `/ganancias/${id}`,
  },

  external: {
    whatsappSend: "https://telorecargo.com/api/enviar-documentos-whatsapp",
  },
} as const;


/** =======================
 *  Auth services
 * ======================= */
export const authApi = {
  requestCode: (phone: string) =>
    axiosClient.post(API_ROUTES.auth.requestCode, { phone }),

  verifyCode: (phone: string, code: string) =>
    axiosClient.post(API_ROUTES.auth.verifyCode, { phone, code }),

  register: (payload: {
    name: string;
    apellidos?: string;
    email: string;
    password: string;
    phone: string;
    code: string;
    terminos: boolean;
    codigo_ref?: string;
  }) =>
    axiosClient.post<ApiResponse<{ user: User; token: string }>>(
      API_ROUTES.auth.register,
      payload
    ),

  login: (email_or_phone: string, password: string) =>
    axiosClient.post<ApiResponse<{ user: User; token: string }>>(
      API_ROUTES.auth.login,
      { email_or_phone, password }
    ),

  changePassword: (current_password: string, new_password: string) =>
    axiosClient.post<ApiResponse<unknown>>(
      API_ROUTES.auth.changePassword,
      { current_password, new_password }
    ),

  resetPasswordByCode: (phone: string, code: string, new_password: string) =>
    axiosClient.post<ApiResponse<unknown>>(
      API_ROUTES.auth.resetPasswordByCode,
      { phone, code, new_password }
    ),
};

/** =======================
 *  Users services
 * ======================= */
export const usersApi = {
  getMe: () => axiosClient.get<ApiResponse<User>>(API_ROUTES.users.me),
};

/** =======================
 *  Account services (NUEVOS)
 * ======================= */
export const accountApi = {
  /** ---- GET (mostrar) ---- */
  getProfile: () =>
    axiosClient.get<ApiResponse<User>>(API_ROUTES.account.profile),

  getFiscal: () =>
    axiosClient.get<ApiResponse<UserFiscalData | null>>(API_ROUTES.account.fiscal),

  getBusiness: () =>
    axiosClient.get<ApiResponse<UserBusiness | null>>(API_ROUTES.account.business),

  listCredentials: () =>
    axiosClient.get<ApiResponse<UserSystemCredential[]>>(API_ROUTES.account.credentials),

  getCredential: (system: SystemKey) =>
    axiosClient.get<ApiResponse<UserSystemCredential>>(API_ROUTES.account.credentialBySystem(system)),

  /** ---- UPDATE / UPSERT ---- */
  updateProfile: (payload: Partial<Pick<User, "name" | "apellidos" | "email" | "phone" | "profile_photo_url">>) =>
    axiosClient.put<ApiResponse<User>>(API_ROUTES.account.profile, payload),

  // subir foto / multipart con _method=PUT
  uploadProfileForm: (fd: FormData) =>
    axiosClient.post<ApiResponse<User>>(API_ROUTES.account.profile, fd),

  updatePassword: (current_password: string, new_password: string, new_password_confirmation: string) =>
    axiosClient.put<ApiResponse<unknown>>(API_ROUTES.account.password, {
      current_password,
      new_password,
      new_password_confirmation,
    }),

  updateFiscal: (payload: Partial<UserFiscalData>) =>
    axiosClient.put<ApiResponse<UserFiscalData>>(API_ROUTES.account.fiscal, payload),

  updateBusiness: (payload: Partial<UserBusiness>) =>
    axiosClient.put<ApiResponse<UserBusiness>>(API_ROUTES.account.business, payload),

  upsertCredential: (payload: UpsertCredentialPayload) =>
    axiosClient.post<ApiResponse<UserSystemCredential>>(API_ROUTES.account.credentials, payload),

  deleteCredential: (system: SystemKey) =>
    axiosClient.delete<ApiResponse<unknown>>(API_ROUTES.account.credentialBySystem(system)),
};

/** =======================
 *  Productos services
 * ======================= */
export const productosApi = {
  list: (params?: PaginationParams) =>
    axiosClient.get<ApiResponse<{ data: Producto[]; total?: number }>>(
      API_ROUTES.productos.root,
      { params }
    ),

  get: (id: number | string) =>
    axiosClient.get<ApiResponse<Producto>>(API_ROUTES.productos.byId(id)),

  create: (payload: Omit<Producto, "id" | "created_at" | "updated_at">) =>
    axiosClient.post<ApiResponse<Producto>>(API_ROUTES.productos.root, payload),

  update: (
    id: number | string,
    payload: Partial<Omit<Producto, "id" | "created_at" | "updated_at">>
  ) =>
    axiosClient.put<ApiResponse<Producto>>(API_ROUTES.productos.byId(id), payload),

  remove: (id: number | string) =>
    axiosClient.delete<ApiResponse<unknown>>(API_ROUTES.productos.byId(id)),
};

/** =======================
 *  Historial Compras
 * ======================= */
export const historialApi = {
  listByUser: (userId: number | string, params?: PaginationParams) =>
    axiosClient.get<ApiResponse<{ data: HistorialCompra[]; total?: number }>>(
      API_ROUTES.historial.byUser(userId),
      { params }
    ),

  create: (payload: Omit<HistorialCompra, "id" | "created_at" | "updated_at">) =>
    axiosClient.post<ApiResponse<HistorialCompra>>(
      API_ROUTES.historial.root,
      payload
    ),
};

/** =======================
 *  Ganancias services (RUTA REAL)
 * ======================= */
export const gananciasApi = {
  // Serializamos a mano para evitar "?user id=1&per_page-500"
  list: (raw?: {
    id_user?: number | string;
    status?: string;
    sistema?: string;
    tipo?: string;
    per_page?: number;
    page?: number;
  }) => {
    const params: Record<string, any> = {
      id_user: raw?.id_user,
      status: raw?.status,
      sistema: raw?.sistema,
      tipo: raw?.tipo,
      per_page: Number.isFinite(raw?.per_page as any) ? Number(raw?.per_page) : undefined,
      page: Number.isFinite(raw?.page as any) ? Number(raw?.page) : undefined,
    };
    Object.keys(params).forEach((k) => (params[k] == null) && delete params[k]);

    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => qs.append(k, String(v)));

    const url = qs.toString()
      ? `${API_ROUTES.ganancias.root}?${qs.toString()}`
      : API_ROUTES.ganancias.root;

    return axiosClient.get<ApiResponse<{ data: Ganancia[]; total?: number; pagination?: { current_page: number; last_page: number } }>>(url);
  },

  get: (id: number | string) =>
    axiosClient.get<ApiResponse<Ganancia>>(API_ROUTES.ganancias.byId(id)),

  create: (payload: Omit<Ganancia, "id" | "created_at" | "updated_at">) =>
    axiosClient.post<ApiResponse<Ganancia>>(API_ROUTES.ganancias.root, payload),

  remove: (id: number | string) =>
    axiosClient.delete<ApiResponse<unknown>>(API_ROUTES.ganancias.byId(id)),
};

/** =======================
 *  Referidos services (solo lo que no es ganancias)
 * ======================= */
export const referidosApi = {
  asignarCodigo: (userId: number | string) =>
    axiosClient.post<ApiResponse<{ codigo_ref: string; user_id: number }>>(
      API_ROUTES.referidos.asignarCodigo(userId)
    ),

  regenerarCodigo: (userId: number | string) =>
    axiosClient.post<ApiResponse<{ codigo_ref: string; user_id: number }>>(
      API_ROUTES.referidos.regenerarCodigo(userId)
    ),

  // Proxy a /ganancias para compatibilidad
  verGanancias: (raw?: {
    id_user?: number | string;
    user_id?: number | string;
    status?: GananciaStatus;
    sistema?: string;
    tipo?: GananciaTipo;
    per_page?: number;
    page?: number;
  }) => {
    return gananciasApi.list({
      id_user: raw?.id_user ?? raw?.user_id,
      status: raw?.status,
      sistema: raw?.sistema,
      tipo: raw?.tipo,
      per_page: raw?.per_page,
      page: raw?.page,
    });
  },

  verRetiros: (params?: {
    user_id?: number | string;
    status?: "pendiente" | "procesado" | "rechazado" | "pagado";
    metodo?: "transferencia" | "paypal" | "oxxo" | "manual" | "otro";
    per_page?: number;
    page?: number;
  }) =>
    axiosClient.get<
      ApiResponse<{ data: RetiroGanancia[]; total?: number; pagination?: { current_page: number; last_page: number } }>
    >(API_ROUTES.referidos.retiros, { params }),
};

/** =======================
 *  WhatsApp externo
 * ======================= */
export const whatsappApi = {
  sendMessage: (params: {
    phone: string;
    message?: string;
    pdf_url?: string;
    xml_url?: string;
  }) =>
    fetch(API_ROUTES.external.whatsappSend, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(params),
    }).then(async (r) => {
      if (!r.ok) throw new Error(`WhatsApp API error: ${r.status}`);
      return r.json();
    }),
};

/** =======================
 *  Helpers
 * ======================= */
export function extract<T>(r: { data: ApiResponse<T> }): T {
  return (r.data?.data as T) ?? (r.data as unknown as T);
}

/** =======================
 *  Auth session helpers
 * ======================= */
export const authSession = {
  async register(payload: {
    name: string;
    apellidos?: string;
    email: string;
    password: string;
    phone: string;
    code: string;
    terminos: boolean;
    codigo_ref?: string;
  }) {
    const { data } = await authApi.register(payload);
    const res = data?.data as { user: User; token: string };
    if (!res?.token || !res?.user) {
      throw new Error(data?.message || "Respuesta inválida del servidor");
    }

    setAuthToken(res.token);
    localStorage.setItem("token", res.token);
    localStorage.setItem("auth_user", JSON.stringify(res.user));
    localStorage.removeItem("auth_token");

    return res;
  },

  async login(email_or_phone: string, password: string) {
    const { data } = await authApi.login(email_or_phone, password);
    const res = data?.data as { user: User; token: string };
    if (!res?.token || !res?.user) {
      throw new Error(data?.message || "Respuesta inválida del servidor");
    }

    setAuthToken(res.token);
    localStorage.setItem("token", res.token);
    localStorage.setItem("auth_user", JSON.stringify(res.user));
    localStorage.removeItem("auth_token");
    return res;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    setAuthToken("");
  },

  getSession(): { token: string; user: User } | null {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("auth_user");
    if (!token || !userRaw) return null;
    try {
      const user = JSON.parse(userRaw) as User;
      return { token, user };
    } catch {
      return null;
    }
  },
};

/** =======================
 *  Password reset helpers
 * ======================= */
export async function requestResetCode(phone: string) {
  const clean = (phone || "").replace(/\D/g, "").slice(0, 10);
  if (!/^\d{10}$/.test(clean)) throw new Error("El teléfono debe tener 10 dígitos");
  return authApi.requestCode(clean);
}

export async function resetPasswordByCodeAndLogin(params: {
  phone: string;
  code: string;
  new_password: string;
}) {
  const phone = params.phone.replace(/\D/g, "").slice(0, 10);
  await authApi.resetPasswordByCode(phone, params.code, params.new_password);
  const { user, token } = await authSession.login(phone, params.new_password);
  return { user, token };
}

// Notifica a toda la app que el usuario local cambió
export function broadcastAuthUserChange(user: User) {
  localStorage.setItem("auth_user", JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("auth:user-changed", { detail: user }));
}
