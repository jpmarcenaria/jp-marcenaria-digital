import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createRequire } from "module";
import { viteSecurityPlugin } from "./security/security-headers.js";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const require = createRequire(import.meta.url);
  let componentTagger: any = null;
  try {
    componentTagger = require('lovable-tagger').componentTagger;
  } catch {
    componentTagger = () => null;
  }
  const useHttps = process.env.VITE_DEV_HTTPS === 'true';
  const keyPath = process.env.VITE_DEV_SSL_KEY_PATH;
  const certPath = process.env.VITE_DEV_SSL_CERT_PATH;

  const httpsConfig = useHttps && keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)
    ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
    : undefined;

  return {
  server: {
    host: "::",
    port: 8080,
    https: httpsConfig,
    // Configurações de segurança para desenvolvimento
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
    }
  },
  
  // Otimizações de build
  build: {
    // Minificação otimizada
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : []
      }
    },
    
    // Code splitting otimizado
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'query-vendor': ['@tanstack/react-query'],
          'router-vendor': ['react-router-dom'],
          
          // Utility chunks
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          'icons': ['lucide-react']
        },
        
        // Otimização de nomes de arquivos
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.tsx', '').replace('.ts', '') : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    
    // Configurações de chunk size
    chunkSizeWarningLimit: 1000,
    
    // Source maps apenas em desenvolvimento
    sourcemap: mode === 'development',
    
    // Otimização de assets
    assetsInlineLimit: 4096,
    
    // Target moderno para melhor otimização
    target: 'esnext'
  },
  
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react-router-dom',
      'lucide-react'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  
  // Configurações de preview
  preview: {
    port: 3000,
    host: true,
    strictPort: true,
    https: httpsConfig,
  },
  
  plugins: [
    react({
      // Otimizações do SWC
      jsxImportSource: '@emotion/react'
    }),
    
    // Plugin de segurança
    viteSecurityPlugin(),
    
    // Desenvolvimento
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@security": path.resolve(__dirname, "./security"),
    },
  },
  
  // Configurações de CSS
  css: {
    devSourcemap: mode === 'development',
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  
  // Configurações de environment
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // Worker configuration
  worker: {
    format: 'es'
  }
  };
});
