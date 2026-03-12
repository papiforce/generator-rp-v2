export type PropertyType =
  | "text"
  | "text-area"
  | "url"
  | "color"
  | "image"
  | "select"
  | "number"
  | "switch";

export interface PropertyDefinition {
  key: string;
  label: string;
  type: PropertyType;
  defaultValue: string;
  options?: { value: string; label: string }[]; // for select type
  without?: string[];
}

export interface TemplateComponentDefinition {
  type: string;
  label: string;
  category: string;
  fixed?: "first" | "last";
  properties: PropertyDefinition[];
}

export interface TemplateComponentInstance {
  id: string;
  type: string;
  props: Record<string, string>;
}

export const COMPONENT_DEFINITIONS: TemplateComponentDefinition[] = [
  {
    type: "banner",
    label: "Banner",
    category: "En-tête",
    fixed: "first",
    properties: [
      {
        key: "bannerUrl",
        label: "URL de la bannière",
        type: "url",
        defaultValue:
          "https://i.pinimg.com/1200x/db/59/32/db5932eba6cd0b033f4d44df1b714bb1.jpg",
      },
      {
        key: "position",
        label: "Position de la bannière",
        type: "select",
        defaultValue: "center",
        options: [
          { label: "Haut", value: "top" },
          { label: "Centré", value: "center" },
          { label: "Bas", value: "bottom" },
          { label: "Gauche", value: "left" },
          { label: "Droite", value: "right" },
        ],
      },
      {
        key: "darkerBanner",
        label: "Assombrir la bannière",
        type: "switch",
        defaultValue: "false",
      },
      {
        key: "coloredBanner",
        label: "Bannière colorée",
        type: "switch",
        defaultValue: "false",
      },
      {
        key: "bannerText",
        label: "Texte sur la bannière",
        type: "switch",
        defaultValue: "true",
      },
      {
        key: "hideTemporality",
        label: "Retirer la temporalité",
        type: "switch",
        defaultValue: "false",
      },
      {
        key: "gradient",
        label: "Dégradé visible",
        type: "switch",
        defaultValue: "true",
      },
    ],
  },
  {
    type: "place",
    label: "Lieu",
    category: "En-tête",
    properties: [
      {
        key: "place",
        label: "Lieu du RP",
        type: "text",
        defaultValue: "Lieu",
      },
      {
        key: "separatorMarginTop",
        label: "Espacement entre texte et séparateur (px)",
        type: "number",
        defaultValue: "20",
      },
      {
        key: "marginTop",
        label: "Espacement haut (px)",
        type: "number",
        defaultValue: "0",
      },
      {
        key: "marginBottom",
        label: "Espacement bas (px)",
        type: "number",
        defaultValue: "32",
      },
    ],
  },
  {
    type: "text-block",
    label: "Texte",
    category: "Contenu",
    properties: [
      {
        key: "text",
        label: "Contenu",
        type: "text-area",
        defaultValue:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
      {
        key: "align",
        label: "Alignement",
        type: "select",
        defaultValue: "justify",
        options: [
          { label: "Gauche", value: "left" },
          { label: "Droite", value: "right" },
          { label: "Centré", value: "center" },
          { label: "Justifié", value: "justify" },
        ],
      },
      {
        key: "marginBottom",
        label: "Espacement bas (px)",
        type: "number",
        defaultValue: "16",
      },
    ],
  },
  {
    type: "image-block",
    label: "Image (simple)",
    category: "Contenu",
    properties: [
      {
        key: "src",
        label: "URL de l'image",
        type: "url",
        defaultValue:
          "https://i.pinimg.com/1200x/bd/7b/f2/bd7bf283387f163df5de683ec7013029.jpg",
      },
      {
        key: "alt",
        label: "Texte alternatif",
        type: "text",
        defaultValue: "Description de l'image",
      },
      {
        key: "width",
        label: "Largeur (%)",
        type: "number",
        defaultValue: "100",
      },
      {
        key: "marginTop",
        label: "Espacement haut (px)",
        type: "number",
        defaultValue: "16",
      },
      {
        key: "marginBottom",
        label: "Espacement bas (px)",
        type: "number",
        defaultValue: "16",
      },
    ],
  },
  {
    type: "image-styled",
    label: "Image (stylisée)",
    category: "Contenu",
    properties: [
      {
        key: "src",
        label: "URL de l'image",
        type: "url",
        defaultValue:
          "https://i.pinimg.com/1200x/bd/7b/f2/bd7bf283387f163df5de683ec7013029.jpg",
      },
      {
        key: "alt",
        label: "Texte alternatif",
        type: "text",
        defaultValue: "Description de l'image",
      },
      {
        key: "width",
        label: "Largeur (%)",
        type: "number",
        defaultValue: "100",
      },
      {
        key: "marginTop",
        label: "Espacement haut (px)",
        type: "number",
        defaultValue: "16",
      },
      {
        key: "marginBottom",
        label: "Espacement bas (px)",
        type: "number",
        defaultValue: "16",
      },
    ],
  },
  {
    type: "speech",
    label: "Paroles avec image",
    category: "Contenu",
    properties: [
      {
        key: "character",
        label: "Personnage",
        type: "select",
        defaultValue: "#9E3333-tyr",
        options: [
          { label: "Tyr", value: "#9E3333-tyr" },
          { label: "Sonya", value: "#9E4FE3-sonya" },
          { label: "Jeshaay", value: "#FF5F15-jeshaay" },
          {
            label: "Jeshaay (Zoan - Serpent)",
            value: "#3BB3B5-jeshaaySerpent",
          },
          {
            label: "Jeshaay (Zoan - Hybride)",
            value: "#3BB3B5-jeshaayHybride",
          },
          { label: "Lem", value: "#DEB887-lem" },
          { label: "Nico Eliza", value: "#990099-nicoeliza" },
          { label: "Velvet", value: "#BD0202-velvet" },
          { label: "Loreleï", value: "#EB635C-lorelei" },
          { label: "PNJ - Civil", value: "#DBA029-civil" },
          { label: "PNJ - Pirate", value: "#EB2F2F-pirate" },
          { label: "PNJ - Marine", value: "#3774ED-marine" },
          { label: "PNJ - Cipher Pol", value: "#24C6E3-cp" },
          { label: "PNJ - Chasseur de primes", value: "#2ABD53-chasseur" },
          { label: "PNJ - Atout révolutionnaire", value: "#754D70-atout" },
          { label: "PNJ - Révolutionnaire", value: "#998997-revolutionnaire" },
        ],
      },
      {
        key: "speech",
        label: "Texte",
        type: "text-area",
        defaultValue:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        without: ["color"],
      },
      {
        key: "marginTop",
        label: "Espacement haut (px)",
        type: "number",
        defaultValue: "16",
      },
      {
        key: "marginBottom",
        label: "Espacement bas (px)",
        type: "number",
        defaultValue: "16",
      },
    ],
  },
  {
    type: "link-youtube",
    label: "Musique (Youtube)",
    category: "Contenu",
    properties: [
      {
        key: "link",
        label: "Url de la video",
        type: "url",
        defaultValue: "",
      },
    ],
  },
  {
    type: "text-participants",
    label: "Participants",
    category: "Contenu",
    properties: [
      {
        key: "text",
        label: "Liste des participants",
        type: "text-area",
        defaultValue: "",
        without: ["color"],
      },
      {
        key: "marginTop",
        label: "Espacement haut (px)",
        type: "number",
        defaultValue: "40",
      },
    ],
  },
  {
    type: "divider",
    label: "Séparateur (∞)",
    category: "Mise en page",
    properties: [
      {
        key: "marginTop",
        label: "Espacement haut (px)",
        type: "number",
        defaultValue: "32",
      },
      {
        key: "marginBottom",
        label: "Espacement bas (px)",
        type: "number",
        defaultValue: "16",
      },
    ],
  },
  {
    type: "separator",
    label: "Séparateur",
    category: "Mise en page",
    properties: [
      {
        key: "width",
        label: "Largeur (px)",
        type: "number",
        defaultValue: "100",
      },
      {
        key: "marginTop",
        label: "Espacement haut (px)",
        type: "number",
        defaultValue: "16",
      },
      {
        key: "marginBottom",
        label: "Espacement bas (px)",
        type: "number",
        defaultValue: "16",
      },
    ],
  },
  {
    type: "footer",
    label: "Footer",
    category: "Pied de page",
    fixed: "last",
    properties: [
      {
        key: "logo",
        label: "Logo",
        type: "select",
        defaultValue: "https://i.servimg.com/u/f64/20/62/43/80/jolly_11.jpg",
        options: [
          {
            label: "Jolly roger",
            value: "https://i.servimg.com/u/f64/20/62/43/80/jolly_11.jpg",
          },
          {
            label: "Jolly roger (noir & blanc)",
            value: "https://i64.servimg.com/u/f64/20/62/43/80/jr-mod10.jpg",
          },
          {
            label: "Tampon",
            value:
              "https://image.noelshack.com/fichiers/2025/51/1/1765810066-tampon-jr.png",
          },
          { label: "Aucun", value: "none" },
        ],
      },
      // {
      //   key: "text",
      //   label: "Texte du footer",
      //   type: "text",
      //   defaultValue: "© 2026 Mon Entreprise. Tous droits réservés.",
      // },
      // {
      //   key: "backgroundColor",
      //   label: "Couleur de fond",
      //   type: "color",
      //   defaultValue: "#1a1a2e",
      // },
      // {
      //   key: "textColor",
      //   label: "Couleur du texte",
      //   type: "color",
      //   defaultValue: "#ffffff",
      // },
      // {
      //   key: "align",
      //   label: "Alignement",
      //   type: "select",
      //   defaultValue: "center",
      //   options: ["left", "center", "right"],
      // },
    ],
  },
];

export function getDefinition(
  type: string,
): TemplateComponentDefinition | undefined {
  return COMPONENT_DEFINITIONS.find((d) => d.type === type);
}

export function createComponentInstance(
  type: string,
): TemplateComponentInstance {
  const def = getDefinition(type);
  if (!def) throw new Error(`Unknown component type: ${type}`);
  const props: Record<string, string> = {};
  for (const p of def.properties) {
    props[p.key] = p.defaultValue;
  }
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    props,
  };
}

export function getCategories(): string[] {
  const cats = new Set<string>();
  for (const d of COMPONENT_DEFINITIONS) {
    cats.add(d.category);
  }
  return Array.from(cats);
}

export function getComponentsByCategory(
  category: string,
): TemplateComponentDefinition[] {
  return COMPONENT_DEFINITIONS.filter((d) => d.category === category);
}
