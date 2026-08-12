/**
 * Aberdeen brand tokens. Source of truth for colors + typography.
 * Extracted from assets/Aberdeen Style Guide 1.0.pdf.
 * Consumed by the UI (Tailwind vars) and by PPTX/DOCX exporters that need hex.
 */

export const brand = {
  colors: {
    aberdeenBlue: "#09375F",
    verdigris: "#44B0B1",
    white: "#FFFFFF",
    onyx: "#404040",
    deepSkyBlue: "#5CC8FF",
    jasper: "#DB504A",
    jade: "#00A676",
    gold: "#F7D002",
  },
  fonts: {
    primary: "Poppins",
    fallback: "Arial",
  },
  logos: {
    primarySvg: "/brand/aberdeen-logo.svg",
    primaryPng: "/brand/aberdeen-logo.png",
    markSvg: "/brand/aberdeen-mark.svg",
    markPng: "/brand/aberdeen-mark.png",
  },
  productName: "Pursuit Copilot",
  companyName: "Aberdeen Advisors",
} as const;

export type BrandColorKey = keyof typeof brand.colors;
