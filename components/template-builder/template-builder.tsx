"use client";

import ComponentList from "@/components/template-builder/component-list";
import PropertiesPanel from "@/components/template-builder/properties-panel";
import StartupModal from "@/components/template-builder/startup-modal";
import TemplateCanvas from "@/components/template-builder/template-canvas";
import { loadSave, renameSave, slugify } from "@/lib/store";
import {
  TemplateComponentInstance,
  createComponentInstance,
  getDefinition,
} from "@/lib/template-components";
import { arrayMove } from "@dnd-kit/sortable";
import { Eye, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";

export default function TemplateBuilder() {
  const [modalOpen, setModalOpen] = useState(true);
  const [templateName, setTemplateName] = useState("");
  const [components, setComponents] = useState<TemplateComponentInstance[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [globalSettings, setGlobalSettings] = useState<Record<string, string>>({
    mode: "light",
    width: "580",
    fontFamily: "montserrat",
    fontSize: "11",
    firstLetter: "false",
    characterName: "",
    title: "",
    timeType: "current",
    year: "1630",
  });

  const selectedComponent =
    selectedId ? (components.find((c) => c.id === selectedId) ?? null) : null;

  const addComponent = useCallback(
    (type: string) => {
      const def = getDefinition(type);
      if (!def) return;

      // Don't add duplicate banner or footer
      if (def.fixed === "first" && components.some((c) => c.type === "banner"))
        return;
      if (def.fixed === "last" && components.some((c) => c.type === "footer"))
        return;

      const instance = createComponentInstance(type);

      setComponents((prev) => {
        if (def.fixed === "first") {
          return [instance, ...prev];
        }
        if (def.fixed === "last") {
          return [...prev, instance];
        }

        // Insert before footer if it exists, otherwise at end
        const footerIdx = prev.findIndex((c) => c.type === "footer");
        if (footerIdx !== -1) {
          const newArr = [...prev];
          newArr.splice(footerIdx, 0, instance);
          return newArr;
        }
        return [...prev, instance];
      });
    },
    [components],
  );

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const reorderComponents = useCallback(
    (oldIndex: number, newIndex: number) => {
      setComponents((prev) => {
        // Ensure we don't move items into banner (0) or footer (last) positions
        const hasBanner = prev[0]?.type === "banner";
        const hasFooter = prev[prev.length - 1]?.type === "footer";
        const minIdx = hasBanner ? 1 : 0;
        const maxIdx = hasFooter ? prev.length - 2 : prev.length - 1;

        const clampedNew = Math.max(minIdx, Math.min(maxIdx, newIndex));
        return arrayMove(prev, oldIndex, clampedNew);
      });
    },
    [],
  );

  const updateComponent = useCallback(
    (id: string, key: string, value: string) => {
      setComponents((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, props: { ...c.props, [key]: value } } : c,
        ),
      );
    },
    [],
  );

  const updateGlobalSettings = useCallback((key: string, value: string) => {
    setGlobalSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateUrlParam = useCallback((name: string) => {
    const slug = slugify(name);
    const params = new URLSearchParams(window.location.search);
    if (slug) {
      params.set("save", slug);
    } else {
      params.delete("save");
    }
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, []);

  const renameTemplate = useCallback(
    (newName: string) => {
      const oldSlug = slugify(templateName);
      setTemplateName(newName);
      if (oldSlug) {
        try {
          renameSave(oldSlug, newName);
        } catch {
          // Save may not exist yet
        }
      }
      updateUrlParam(newName);
    },
    [templateName, updateUrlParam],
  );

  const handleLoadSave = useCallback(
    (slug: string) => {
      const data = loadSave(slug);
      if (data) {
        setTemplateName(data.name);
        setComponents(data.components);
        setGlobalSettings(data.globalSettings);
        updateUrlParam(data.name);
      }
      setModalOpen(false);
    },
    [updateUrlParam],
  );

  const handleCreateNew = useCallback(
    (name: string) => {
      setTemplateName(name);
      setComponents([]);
      setGlobalSettings({
        mode: "light",
        width: "580",
        fontFamily: "montserrat",
        fontSize: "11",
        firstLetter: "false",
        characterName: "",
        title: "",
        timeType: "current",
        year: "1630",
      });
      updateUrlParam(name);
      setModalOpen(false);
    },
    [updateUrlParam],
  );

  // Auto-load from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saveSlug = params.get("save");
    if (saveSlug) {
      const data = loadSave(saveSlug);
      if (data) {
        setTemplateName(data.name);
        setComponents(data.components);
        setGlobalSettings(data.globalSettings);
        setModalOpen(false);
      }
    }
  }, []);

  return (
    <>
      <StartupModal
        open={modalOpen}
        onLoadSave={handleLoadSave}
        onCreateNew={handleCreateNew}
      />

      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="border-b px-4 py-3 shrink-0 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Template Builder
            {templateName && (
              <span className="text-muted-foreground font-normal text-base ml-2">
                — {templateName}
              </span>
            )}
          </h1>
          <Button
            onClick={() => setModalOpen(true)}
            className="text-sm px-3 py-1.5 rounded-md cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            Sauvegardes
          </Button>
        </header>

        {/* 3-column layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left toggle */}
          <button
            onClick={() => setLeftOpen((v) => !v)}
            className="shrink-0 w-6 flex items-center justify-center border-r hover:bg-muted transition-colors cursor-pointer"
            title={leftOpen ? "Masquer les composants" : "Afficher les composants"}
          >
            {leftOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>

          {/* Left column - Component list */}
          {leftOpen && (
            <aside className={`border-r p-3 overflow-y-auto shrink-0 ${rightOpen ? "w-64" : "w-1/3"}`}>
              <ComponentList onAddComponent={addComponent} />
            </aside>
          )}

          {/* Center column - Template canvas */}
          <main className="flex-1 p-4 overflow-y-auto">
            <TemplateCanvas
              globalSettings={globalSettings}
              components={components}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onRemove={removeComponent}
              onReorder={reorderComponents}
              onDropNew={addComponent}
            />
          </main>

          {/* Right column - Properties panel */}
          {rightOpen && (
            <aside className={`border-l shrink-0 flex flex-col overflow-hidden ${leftOpen ? "w-72" : "w-1/3"}`}>
              <PropertiesPanel
                selectedComponent={selectedComponent}
                components={components}
                templateName={templateName}
                globalSettings={globalSettings}
                onUpdateComponent={updateComponent}
                onUpdateGlobalSettings={updateGlobalSettings}
                onRenameTemplate={renameTemplate}
              />
            </aside>
          )}

          {/* Right toggle */}
          <button
            onClick={() => setRightOpen((v) => !v)}
            className="shrink-0 w-6 flex items-center justify-center border-l hover:bg-muted transition-colors cursor-pointer"
            title={rightOpen ? "Masquer les propriétés" : "Afficher les propriétés"}
          >
            {rightOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </>
  );
}
