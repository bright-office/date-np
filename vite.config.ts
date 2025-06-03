import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
    const isReleaseBuild = mode === "release";

    return {
        build: {
            minify: isReleaseBuild,
            lib: {
                entry: [resolve(__dirname, "src/ui.ts"), resolve(__dirname, "src/core.ts")],
                name: "date-np",
                formats: ["es"],
            },
            outDir: "dist",
            emptyOutDir: true,
            rollupOptions: {
                // Means;
                // don't include this in the final build.
                // these are required to be present in the env where this is going to be used. 
                external: ['react', 'react-dom', 'react/jsx-runtime'],
                output: {
                    intro: (chunk) => {
                        if (chunk.fileName.includes('src/picker.js')) {
                            return `import "../style.css";`
                        }
                        return ''
                    },
                    preserveModules: true,
                    dir: 'dist',
                    entryFileNames: '[name].js',
                    exports: 'named'
                }
            }
        },
        plugins: [
            tailwindcss(),
            dts({ outDir: "./dist/types" }),
            viteReact(),
        ]
    }
})
