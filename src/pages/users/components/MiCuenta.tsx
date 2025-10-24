import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  Paper,
  Stack,
  Avatar,
  Button,
  TextField,
  Typography,
  Chip,
  FormControlLabel,
  Switch,
} from "@mui/material";
import Page from "./Page";
import { brandBlue } from "./Shell";
import { authSession, User, accountApi, broadcastAuthUserChange } from "../../../services/api";
import axiosClient from "../../../services/axiosClient";

export default function MiCuenta() {
  const [user, setUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);

  // Cargar usuario del localStorage al montar
  useEffect(() => {
    const session = authSession.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  }, []);

  // Maneja cambios de input
  const handleChange = (field: keyof User, value: string) => {
    setUser((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // Guardar cambios (JSON) cuando NO hay archivo
  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const payload = {
        name: user.name,
        apellidos: user.apellidos ?? "",
        email: user.email,
        phone: user.phone ?? "",
        // NO mandamos profile_photo_url aquí; la foto ahora se sube con archivo
      };
      const { data } = await accountApi.updateProfile(payload);

      // Actualiza sesión local para que todo el app vea los cambios
      const session = authSession.getSession();
      if (session) {
        const updated = { ...session.user, ...data.data };
        broadcastAuthUserChange(updated as User);

        setUser(updated as User);
      }
      alert("✅ Datos del usuario actualizados.");
    } catch (e: any) {
      alert(`❌ No se pudieron guardar los cambios: ${e?.message || "Error desconocido"}`);
    } finally {
      setSaving(false);
    }
  };

  // Abrir selector de archivo
  const handlePickPhoto = () => fileInputRef.current?.click();

  // Al seleccionar la foto: enviar como multipart/form-data AL MISMO ENDPOINT
 const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user) return;
  setSaving(true);
  try {
    const fd = new FormData();
    fd.append("photo", file);
    fd.append("name", user.name || "");
    if (user.apellidos) fd.append("apellidos", user.apellidos);
    fd.append("email", user.email || "");
    if (user.phone) fd.append("phone", user.phone);
    fd.append("_method", "PUT"); // <- spoof del método

    // ¡OJO! No pongas Content-Type, deja que el navegador ponga el boundary
    const { data } = await accountApi.uploadProfileForm(fd);

    const session = authSession.getSession();
    if (session) {
      const updated = { ...session.user, ...data.data };
      localStorage.setItem("auth_user", JSON.stringify(updated));
      setUser(updated as User);
    }
    alert("✅ Foto de perfil actualizada.");
  } catch (err: any) {
    alert(`❌ Error subiendo la foto: ${err?.message || "Error desconocido"}`);
  } finally {
    setSaving(false);
    e.target.value = "";
  }
};



  return (
    <Page title="Mi cuenta">
      <Grid container spacing={2}>
        {/* Columna izquierda: Perfil del usuario */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2} alignItems="center">
              <Avatar
                src={user?.profile_photo_url || undefined}
                sx={{ width: 96, height: 96, bgcolor: brandBlue, fontSize: 32 }}
              >
                {!user?.profile_photo_url && (user?.name?.[0]?.toUpperCase() || "U")}
              </Avatar>

              {/* Selector de archivo oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoSelected}
              />
              {/* <Button variant="outlined" onClick={handlePickPhoto} disabled={saving}>
                Cambiar foto
              </Button> */}

              <Stack spacing={1} sx={{ width: "100%" }}>
                <TextField
                  label="Nombre"
                  fullWidth
                  value={user?.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                <TextField
                  label="Apellidos"
                  fullWidth
                  value={user?.apellidos || ""}
                  onChange={(e) => handleChange("apellidos", e.target.value)}
                />
                <TextField
                  label="Email"
                  fullWidth
                  value={user?.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                <TextField
                  label="Teléfono"
                  fullWidth
                  value={user?.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <Button variant="contained" size="large" onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Columna derecha: Info/UI adicional (sin fiscales ni credenciales) */}
        <Grid item xs={12} md={8}>
  {/* 🔹 Sección de Accesos rápidos */}

  {/* 🔹 Sección de Información general */}
  <Paper sx={{ p: 2, mb: 2 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Información de tu cuenta
    </Typography>

    <Typography variant="body2" sx={{ color: "text.secondary" }}>
      Aquí se deben mostrar los datos generales del usuario: nombre completo, correo,
      teléfono.  

    </Typography>
  </Paper>


</Grid>

      </Grid>
    </Page>
  );
}
