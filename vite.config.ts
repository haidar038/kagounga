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
        dedupe: ["react", "react-dom", "react-router-dom"],
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // React core libraries
                    if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router-dom") || id.includes("node_modules/scheduler")) {
                        return "react-vendor";
                    }

                    // Radix UI components
                    if (id.includes("node_modules/@radix-ui")) {
                        return "radix-ui";
                    }

                    // State management and data fetching
                    if (id.includes("node_modules/@tanstack/react-query") || id.includes("node_modules/@supabase")) {
                        return "state-vendor";
                    }

                    // Form libraries
                    if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/@hookform") || id.includes("node_modules/zod")) {
                        return "form-vendor";
                    }

                    // Chart libraries
                    if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
                        return "chart-vendor";
                    }

                    // i18n libraries
                    if (id.includes("node_modules/i18next") || id.includes("node_modules/react-i18next")) {
                        return "i18n-vendor";
                    }

                    // UI utilities and animations
                    if (id.includes("node_modules/lucide-react") || id.includes("node_modules/embla-carousel") || id.includes("node_modules/sonner") || id.includes("node_modules/vaul") || id.includes("node_modules/cmdk")) {
                        return "ui-utils";
                    }

                    // Date and utility libraries
                    if (id.includes("node_modules/date-fns") || id.includes("node_modules/fuse.js") || id.includes("node_modules/clsx") || id.includes("node_modules/class-variance-authority") || id.includes("node_modules/tailwind-merge")) {
                        return "utils-vendor";
                    }

                    // Other node_modules
                    if (id.includes("node_modules")) {
                        return "vendor";
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: mode === "development",
    },
}));
