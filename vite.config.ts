import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
    },
    plugins: [react()].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // React core
                    "react-vendor": ["react", "react-dom", "react-router-dom"],

                    // UI libraries (adjust based on what you're using)
                    "ui-vendor": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"], // example

                    // Other large libraries
                    "utils-vendor": ["lodash", "date-fns", "axios"], // example
                },
            },
        },
    },
}));
