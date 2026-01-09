import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
    server: {
      host: true,      // সব host access
      port: 4173,
      strictPort: false,
      allowedHosts: [
        'dashboard.rt1percent.com',  // specific host
        '.'                          // সব host allow
      ],
    },
  };
});