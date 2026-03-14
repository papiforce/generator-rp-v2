"use client";

import TextColorEditor from "@/components/template-builder/text-color-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { generateFullHTML } from "@/lib/html-generator";
import { saveCurrent } from "@/lib/store";
import {
  TemplateComponentInstance,
  getDefinition,
} from "@/lib/template-components";
import { Check, Copy, Save } from "lucide-react";
import { useState } from "react";

function formatHTML(html: string): string {
  const blockTags = [
    "div",
    "p",
    "hr",
    "img",
    "style",
    "span",
    "ul",
    "ol",
    "li",
  ];

  let code = html
    .replace(/\n/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const openRegex = new RegExp(`(<(?:${blockTags.join("|")})[ >/])`, "gi");
  code = code.replace(openRegex, "<!--\n\n-->$1");

  const closeRegex = new RegExp(`(<\\/(?:${blockTags.join("|")})>)`, "gi");
  code = code.replace(closeRegex, "$1<!--\n\n-->");

  code = code.replace(/^<!--\n\n-->/, "").replace(/<!--\n\n-->$/, "");
  code = code.replace(/(<!--\n\n-->\s*){2,}/g, "<!--\n\n-->");

  const lines = code.split("\n");
  let indent = 0;
  const result: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "") {
      result.push("");
      continue;
    }

    if (line === "<!--" || line === "-->") {
      result.push("  ".repeat(Math.max(indent, 0)) + line);
      continue;
    }

    const startsWithClose = /^<\//.test(line);
    const isSelfClosing =
      /\/>$/.test(line) || /^<(hr|img|br|input|meta|link)\b/i.test(line);
    const isInline = /^<(\w+)[^>]*>.*<\/\1>$/.test(line);

    if (startsWithClose) indent--;

    result.push("  ".repeat(Math.max(indent, 0)) + line);

    if (!startsWithClose && !isSelfClosing && !isInline && /^<\w+/.test(line)) {
      indent++;
    }
  }

  return result.join("\n");
}

interface PropertiesPanelProps {
  selectedComponent: TemplateComponentInstance | null;
  components: TemplateComponentInstance[];
  templateName: string;
  globalSettings: Record<string, string>;
  onUpdateComponent: (id: string, key: string, value: string) => void;
  onUpdateGlobalSettings: (key: string, value: string) => void;
  onRenameTemplate: (name: string) => void;
}

export default function PropertiesPanel({
  selectedComponent,
  components,
  templateName,
  globalSettings,
  onUpdateComponent,
  onUpdateGlobalSettings,
}: PropertiesPanelProps) {
  const [copyLabel, setCopyLabel] = useState<string | null>(null);
  const [saveLabel, setSaveLabel] = useState<string | null>(null);

  const handleCopyHTML = async () => {
    let raw = generateFullHTML(globalSettings, components);
    raw = raw.replace(/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/gi, "<br/>");
    const html = formatHTML(raw);
    try {
      await navigator.clipboard.writeText(html);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = html;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopyLabel("Copié !");
    setTimeout(() => setCopyLabel(null), 2000);
  };

  const handleSave = () => {
    saveCurrent(templateName, components, globalSettings);
    setSaveLabel("Sauvegardé !");
    setTimeout(() => setSaveLabel(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {selectedComponent ?
          <ComponentProperties
            component={selectedComponent}
            globalSettings={globalSettings}
            onUpdate={onUpdateComponent}
          />
        : <GlobalProperties
            settings={globalSettings}
            templateName={templateName}
            onUpdate={onUpdateGlobalSettings}
          />
        }
      </div>

      <div className="border-t p-3 flex flex-col gap-2 shrink-0">
        <Button
          onClick={handleCopyHTML}
          variant="outline"
          className="w-full"
          disabled={
            !components.some((c) => c.type === "banner") ||
            !components.some((c) => c.type === "footer")
          }
        >
          {copyLabel ?
            <Check className="h-4 w-4 mr-2" />
          : <Copy className="h-4 w-4 mr-2" />}
          {copyLabel ?? "Copier le code HTML"}
        </Button>
        <Button onClick={handleSave} className="w-full">
          {saveLabel ?
            <Check className="h-4 w-4 mr-2" />
          : <Save className="h-4 w-4 mr-2" />}
          {saveLabel ?? "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
}

function ComponentProperties({
  component,
  globalSettings,
  onUpdate,
}: {
  component: TemplateComponentInstance;
  globalSettings: Record<string, string>;
  onUpdate: (id: string, key: string, value: string) => void;
}) {
  const def = getDefinition(component.type);
  if (!def) return null;

  return (
    <div className="flex flex-col gap-4 p-3">
      <h2 className="text-base font-semibold">{def.label}</h2>
      <p className="text-xs text-muted-foreground">
        Modifiez les propriétés de ce composant
      </p>
      {def.properties.map((propDef) => (
        <div key={propDef.key} className="flex flex-col gap-1.5">
          <Label htmlFor={propDef.key}>{propDef.label}</Label>
          {propDef.type === "select" ?
            <Select
              value={component.props[propDef.key] || propDef.defaultValue}
              onValueChange={(value) =>
                onUpdate(component.id, propDef.key, value)
              }
            >
              <SelectTrigger id={propDef.key}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {propDef.options?.map((opt) => (
                  <SelectItem key={opt.label} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          : propDef.type === "color" ?
            <div className="flex items-center gap-2">
              <input
                type="color"
                id={propDef.key}
                value={component.props[propDef.key] || propDef.defaultValue}
                onChange={(e) =>
                  onUpdate(component.id, propDef.key, e.target.value)
                }
                className="h-9 w-9 rounded border p-0.5 cursor-pointer"
              />
              <Input
                value={component.props[propDef.key] || propDef.defaultValue}
                onChange={(e) =>
                  onUpdate(component.id, propDef.key, e.target.value)
                }
                className="flex-1"
              />
            </div>
          : propDef.type === "switch" ?
            <div className="flex items-center gap-2">
              <Switch
                id={propDef.key}
                checked={component.props[propDef.key] === "true"}
                onCheckedChange={(checked) =>
                  onUpdate(
                    component.id,
                    propDef.key,
                    checked ? "true" : "false",
                  )
                }
              />
            </div>
          : propDef.type === "text-area" ?
            <TextColorEditor
              value={component.props[propDef.key] || ""}
              onChange={(value) => onUpdate(component.id, propDef.key, value)}
              withoutColor={
                propDef.without ? propDef.without.includes("color") : false
              }
              fontSize={globalSettings.fontSize}
            />
          : <Input
              id={propDef.key}
              type={propDef.type}
              value={component.props[propDef.key] || ""}
              onChange={(e) => {
                let val = e.target.value;
                if (
                  component.type === "link-youtube" &&
                  propDef.key === "link"
                ) {
                  try {
                    const url = new URL(val);
                    const v = url.searchParams.get("v");
                    const list = url.searchParams.get("list");
                    if (v) {
                      val = `https://www.youtube.com/embed/${v}${list ? `?list=${list}` : ""}`;
                    }
                  } catch {
                    // URL invalide, on garde la valeur brute
                  }
                }
                onUpdate(component.id, propDef.key, val);
              }}
            />
          }
        </div>
      ))}
    </div>
  );
}

function GlobalProperties({
  settings,
  templateName,
  onUpdate,
}: {
  settings: Record<string, string>;
  templateName: string;
  onUpdate: (key: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-3">
      <h2 className="text-base font-semibold">Propriétés générales</h2>
      <p className="text-xs text-muted-foreground">
        Sélectionnez un composant pour modifier ses propriétés, ou modifiez les
        paramètres globaux ci-dessous.
      </p>

      {/* <div className="flex flex-col gap-1.5">
        <Label htmlFor="templateName">Nom du template</Label>
        <Input id="templateName" value={templateName} disabled />
      </div> */}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="globalMode">Mode</Label>
        <Select
          value={settings.mode}
          onValueChange={(value) => onUpdate("mode", value)}
          defaultValue={settings.mode || "light"}
        >
          <SelectTrigger id="globalMode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="globalWidth">Largeur de la fiche</Label>
        <Select
          value={settings.width || "580"}
          onValueChange={(value) => onUpdate("width", value)}
          defaultValue={settings.width || "580"}
        >
          <SelectTrigger id="globalWidth">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            <SelectItem value="580">Normale</SelectItem>
            <SelectItem value="800">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="globalFontFamily">Police d'écriture</Label>
        <Select
          value={settings.fontFamily || "montserrat"}
          onValueChange={(value) => onUpdate("fontFamily", value)}
          defaultValue={settings.fontFamily || "montserrat"}
        >
          <SelectTrigger id="globalFontFamily">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            <SelectItem value="montserrat">Montserrat</SelectItem>
            <SelectItem value="noto-serif-jp">Noto Serif Japanese</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="globalFontSize">Taille d'écriture</Label>
        <Input
          id="globalFontSize"
          type="number"
          placeholder="11"
          value={settings.fontSize}
          onChange={(e) => onUpdate("fontSize", e.target.value)}
        />
      </div>

      <div className="h-px w-full bg-border my-2" />

      <h2 className="text-base font-semibold">Propriétés de la fiche</h2>
      <p className="text-xs text-muted-foreground">
        Modifiez les paramètres de la fiche ci-dessous.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="characterName">Nom du personnage</Label>
        <Input
          id="characterName"
          type="string"
          placeholder="Nom du personnage"
          value={settings.characterName}
          onChange={(e) => onUpdate("characterName", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Titre du RP</Label>
        <Input
          id="title"
          type="string"
          placeholder="Titre"
          value={settings.title}
          onChange={(e) => onUpdate("title", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="timeType">Époque</Label>
        <Select
          value={settings.timeType || "current"}
          onValueChange={(value) => onUpdate("timeType", value)}
          defaultValue={settings.timeType || "current"}
        >
          <SelectTrigger id="timeType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            <SelectItem value="current">Présent</SelectItem>
            <SelectItem value="past">Flashback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="year">Année</Label>
        <Input
          id="year"
          type="string"
          placeholder="1630"
          value={settings.year}
          onChange={(e) => onUpdate("year", e.target.value)}
        />
      </div>
    </div>
  );
}
