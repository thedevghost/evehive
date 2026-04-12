# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deployment

This frontend can be deployed to Vercel, but the backend must be hosted separately because the app uses Express, Socket.IO, and a local database layer.

Recommended setup:

1. Deploy `zeron-program/client` to Vercel as a Vite project.
2. Set `VITE_API_URL` in Vercel to your backend URL, for example `https://your-backend-host.com/api`.
3. Deploy the backend (`zeron-program/server`) to a Node host such as Render, Railway, Fly.io, or another always-on service.
4. Use a real hosted database for production. The current local PGlite storage is not suitable for Vercel.
5. Keep `client/vercel.json` so React Router routes refresh correctly.

Local environment example:

```bash
VITE_API_URL=http://localhost:5000/api
```
