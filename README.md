# unmute — Demo artista

App HTML del recorrido **solo artista**. Se siente como la app: sin menú lateral, teléfono a pantalla.

## Flujo

1. Splash → **Comenzar**
2. **Login** (Google / Apple / correo) — o **Regístrate** desde el mismo screen
3. Si te registras → completar perfil
4. Inicio (todas las obras) · Subir · Mis obras · Perfil

## Local

```bash
cd demo-artista
python3 -m http.server 4173
```

Abre http://127.0.0.1:4173/

## GitHub + Vercel

Repo dedicado (recomendado) o Root Directory = `demo-artista` en Vercel. Framework: Other, sin build.
