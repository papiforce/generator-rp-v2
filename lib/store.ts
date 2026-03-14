import {
  TemplateComponentInstance,
  getDefinition,
} from "./template-components";

const SAVES_INDEX_KEY = "template-builder-saves";

export interface SaveData {
  name: string;
  slug: string;
  components: TemplateComponentInstance[];
  globalSettings: Record<string, string>;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getSavesList(): { name: string; slug: string }[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SAVES_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function loadSave(slug: string): SaveData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`template-${slug}`);
  if (!raw) return null;
  try {
    const data: SaveData = JSON.parse(raw);
    // Migrate components to match current definitions
    data.components = data.components.map((comp) => {
      const def = getDefinition(comp.type);
      if (!def) return comp;

      const migratedProps: Record<string, string> = {};
      for (const propDef of def.properties) {
        migratedProps[propDef.key] =
          comp.props[propDef.key] ?? propDef.defaultValue;
      }
      return { ...comp, props: migratedProps };
    });
    return data;
  } catch {
    return null;
  }
}

export function saveCurrent(
  name: string,
  components: TemplateComponentInstance[],
  globalSettings: Record<string, string>,
): void {
  const slug = slugify(name);

  // Prepare components for save: empty text fields, remove image props
  const cleanedComponents = components.map((comp) => {
    const def = getDefinition(comp.type);
    if (!def) return comp;

    const cleanedProps: Record<string, string> = {};
    for (const propDef of def.properties) {
      if (propDef.type === "image") {
        // Don't save image properties
        continue;
      }
      if (propDef.type === "text") {
        // Save text fields as empty
        cleanedProps[propDef.key] = "";
      } else {
        cleanedProps[propDef.key] = comp.props[propDef.key];
      }
    }

    return { ...comp, props: cleanedProps };
  });

  // Ensure banner is first, footer is last
  const banner = cleanedComponents.find((c) => c.type === "banner");
  const footer = cleanedComponents.find((c) => c.type === "footer");
  const rest = cleanedComponents.filter(
    (c) => c.type !== "banner" && c.type !== "footer",
  );
  const ordered = [
    ...(banner ? [banner] : []),
    ...rest,
    ...(footer ? [footer] : []),
  ];

  const saveData: SaveData = {
    name,
    slug,
    components: ordered,
    globalSettings,
  };

  localStorage.setItem(`template-${slug}`, JSON.stringify(saveData));

  // Update saves index
  const list = getSavesList();
  const existing = list.find((s) => s.slug === slug);
  if (existing) {
    existing.name = name;
  } else {
    list.push({ name, slug });
  }
  localStorage.setItem(SAVES_INDEX_KEY, JSON.stringify(list));
}

export function deleteSave(slug: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`template-${slug}`);
  const list = getSavesList().filter((s) => s.slug !== slug);
  localStorage.setItem(SAVES_INDEX_KEY, JSON.stringify(list));
}

export function renameSave(
  oldSlug: string,
  newName: string,
): { name: string; slug: string } {
  const newSlug = slugify(newName);
  const data = loadSave(oldSlug);
  if (!data) throw new Error("Save not found");

  // Remove old entry
  localStorage.removeItem(`template-${oldSlug}`);
  const list = getSavesList().filter((s) => s.slug !== oldSlug);

  // Write new entry
  data.name = newName;
  data.slug = newSlug;
  localStorage.setItem(`template-${newSlug}`, JSON.stringify(data));
  list.push({ name: newName, slug: newSlug });
  localStorage.setItem(SAVES_INDEX_KEY, JSON.stringify(list));

  return { name: newName, slug: newSlug };
}
