export const CABINETS = [
  { id: "base",       label: "Spodná skrinka",    w: 60,  h: 85,  d: 56, color: "#B8965A" },
  { id: "wall",       label: "Horná skrinka",      w: 60,  h: 72,  d: 32, color: "#C4A265" },
  { id: "tall",       label: "Vysoká skriňa",      w: 60,  h: 210, d: 56, color: "#A07D3F" },
  { id: "sink",       label: "Drezová skrinka",    w: 80,  h: 85,  d: 56, color: "#7BA4B8" },
  { id: "dish",       label: "Umývačka riadu",     w: 60,  h: 82,  d: 56, color: "#8A9EAF" },
  { id: "oven",       label: "Skrinka na rúru",    w: 60,  h: 85,  d: 56, color: "#555" },
  { id: "cornerBase", label: "Rohová spodná",      w: 90,  h: 85,  d: 90, color: "#A8884A" },
  { id: "cornerWall", label: "Rohová horná",       w: 65,  h: 72,  d: 65, color: "#BDA55A" },
  { id: "window",     label: "Okno",               w: 120, h: 120, d: 0,  color: "#A8D8EA" },
];

export const BACKSPLASH_MATERIALS = [
  { id: "tile",  label: "Obklad – dlaždice",       color: "#D6CFC4", pat: "tile" },
  { id: "glass", label: "Sklo – lesklé",            color: "#C8DDE6", pat: "glass" },
  { id: "brick", label: "Tehla / obkladový kameň",  color: "#C4A88A", pat: "brick" },
  { id: "wood",  label: "Drevený panel",             color: "#B89A6A", pat: "wood" },
];

export const COUNTER_MATERIALS = [
  { id: "granite",  label: "Žula tmavá",    color: "#4A4A4A", top: "#555" },
  { id: "marble",   label: "Mramor biely",  color: "#E8E4DF", top: "#F0ECE8" },
  { id: "wood",     label: "Masívne drevo",  color: "#A07840", top: "#B8904E" },
  { id: "quartz",   label: "Quartz sivý",   color: "#9A9A9A", top: "#ABABAB" },
  { id: "laminate", label: "Laminát biely",  color: "#E0DDD5", top: "#EBE8E2" },
];

export const BASE_IDS = new Set(["base", "sink", "dish", "oven", "cornerBase"]);

export const COLORS = {
  oak: "#C4A265",
  oakLight: "#D4BA85",
  oakDark: "#8B6914",
};

/**
 * Generate SVG path for room shape
 * L-right: arm extends down-left; L-left: arm extends down-right
 * U: both arms extend down
 */
export function roomPath(w, h, shape, lW, lH, rW) {
  if (shape === "rect") return `M0,0 L${w},0 L${w},${h} L0,${h} Z`;
  if (shape === "L-right") return `M0,0 L${w},0 L${w},${h} L${lW},${h} L${lW},${h + lH} L0,${h + lH} Z`;
  if (shape === "L-left") return `M0,0 L${w},0 L${w},${h + lH} L${w - lW},${h + lH} L${w - lW},${h} L0,${h} Z`;
  // U-shape: both arms
  const rr = rW || lW;
  return `M0,0 L${w},0 L${w},${h + lH} L${w - rr},${h + lH} L${w - rr},${h} L${lW},${h} L${lW},${h + lH} L0,${h + lH} Z`;
}
