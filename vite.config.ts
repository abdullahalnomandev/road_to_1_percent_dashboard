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
      host: true, // dev only
    },

    preview: {
      host: true,
      allowedHosts: ["dashboard.rt1percent.com"],
    },
  };
});
