/// <reference types="vite/client" />

// Declaracao para html2pdf.js (carregado via CDN em runtime)
interface Window {
  html2pdf: () => {
    set: (opt: Record<string, unknown>) => {
      from: (element: HTMLElement | null) => {
        save: () => void;
      };
    };
  };
}
