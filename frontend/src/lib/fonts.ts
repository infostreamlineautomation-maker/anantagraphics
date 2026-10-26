import localFont from "next/font/local";
import {
  Comme,
  Didact_Gothic,
  DM_Mono,
  Domine,
  Encode_Sans_Semi_Expanded,
  Fenix,
  Gloock,
  Instrument_Sans,
} from "next/font/google";

// The Figma file's fonts. Only the weights the design uses are loaded. Fonts seen on first paint
// (nav/body, headings, leads) are preloaded; the rest (footer, showcase tabs, eyebrows…) load on use,
// so on slow phones they don't compete with the hero image.
// Loaded locally to eliminate Next.js Turbopack fallback metric warnings
const googleSansFlex = localFont({
  src: "../fonts/GoogleSansFlex.ttf",
  variable: "--font-google-sans-flex",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
const domine = Domine({ subsets: ["latin"], weight: ["700"], variable: "--font-domine" });
const fenix = Fenix({ subsets: ["latin"], weight: "400", variable: "--font-fenix" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: "400", variable: "--font-dm-mono", preload: false });
const gloock = Gloock({ subsets: ["latin"], weight: "400", variable: "--font-gloock", preload: false });
const comme = Comme({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-comme", preload: false });
const encodeSemiExpanded = Encode_Sans_Semi_Expanded({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-encode-semi-expanded",
  preload: false,
});
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", preload: false });
const didactGothic = Didact_Gothic({ subsets: ["latin"], weight: "400", variable: "--font-didact-gothic", preload: false });

export const fontVariables = [
  googleSansFlex,
  domine,
  fenix,
  dmMono,
  gloock,
  comme,
  encodeSemiExpanded,
  instrumentSans,
  didactGothic,
]
  .map((f) => f.variable)
  .join(" ");
