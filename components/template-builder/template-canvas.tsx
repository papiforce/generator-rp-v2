"use client";

import { renderComponentHTML } from "@/lib/html-generator";
import {
  TemplateComponentInstance,
  getDefinition,
} from "@/lib/template-components";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

interface TemplateCanvasProps {
  globalSettings: Record<string, string>;
  components: TemplateComponentInstance[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onDropNew: (type: string) => void;
}

const SortableItem = React.memo(function SortableItem({
  globalSettings,
  comp,
  isSelected,
  onSelect,
  onRemove,
}: {
  globalSettings: Record<string, string>;
  comp: TemplateComponentInstance;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
}) {
  const def = getDefinition(comp.type);
  const isFixed = def?.fixed !== undefined;
  const withPadding = ["text-block", "text-participants", "speech"];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: comp.id,
    disabled: isFixed,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSelect = useCallback(
    () => onSelect(comp.id),
    [onSelect, comp.id],
  );
  const handleRemove = useCallback(
    () => onRemove(comp.id),
    [onRemove, comp.id],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!isFixed ? { ...attributes, ...listeners } : {})}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect();
      }}
      className={cn(
        "relative cursor-pointer flex items-center gap-2 group outline-2 outline-transparent hover:outline-blue-400",
        isSelected && "outline-blue-400",
        isDragging && "opacity-50",
        isFixed && "opacity-90",
      )}
    >
      <div
        className={cn(
          "flex-1 min-w-0 w-full",
          withPadding.includes(comp.type) && "mx-10",
        )}
      >
        <ComponentPreview globalSettings={globalSettings} comp={comp} />
      </div>

      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="absolute -right-12 shrink-0 p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
        >
          <Trash2 className="h-6 w-6" />
        </button>
      )}
    </div>
  );
});

const ComponentPreview = React.memo(
  function ComponentPreview({
    globalSettings,
    comp,
  }: {
    globalSettings: Record<string, string>;
    comp: TemplateComponentInstance;
  }) {
    const def = getDefinition(comp.type);
    const html = useMemo(
      () => renderComponentHTML(globalSettings, comp),
      [globalSettings, comp],
    );
    if (!def) return null;

    return (
      <div className="flex flex-col gap-1">
        <div
          className="pointer-events-none overflow-hidden [&_iframe]:pointer-events-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  },
  (prev, next) =>
    prev.comp.id === next.comp.id &&
    prev.comp.type === next.comp.type &&
    JSON.stringify(prev.comp.props) === JSON.stringify(next.comp.props) &&
    prev.globalSettings === next.globalSettings,
);

export default function TemplateCanvas({
  globalSettings,
  components,
  selectedId,
  onSelect,
  onRemove,
  onReorder,
  onDropNew,
}: TemplateCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = components.findIndex((c) => c.id === active.id);
    const newIndex = components.findIndex((c) => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Don't allow moving banner (idx 0) or footer (last idx)
    const activeDef = getDefinition(components[oldIndex].type);
    const overDef = getDefinition(components[newIndex].type);
    if (activeDef?.fixed || overDef?.fixed) return;

    onReorder(oldIndex, newIndex);
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("component-type");
    if (type) {
      onDropNew(type);
    }
  };

  const activeComp =
    activeId ? components.find((c) => c.id === activeId) : null;

  return (
    <div
      className="flex flex-col gap-2 min-h-full py-2 px-8 rounded-lg border-2 border-dashed border-border bg-muted/30"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={handleDrop}
      onClick={() => onSelect(null)}
    >
      <h2 className="text-base font-semibold px-1">Template</h2>

      {components.length === 0 ?
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Glissez des composants ici pour commencer
        </div>
      : <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={components.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              className={cn(
                "flex flex-col mx-auto",
                globalSettings.width === "580" ? "w-145" : "w-200",
                globalSettings.mode === "dark" ?
                  "bg-[oklch(0.2223_0.006_271.1393)]! text-white!"
                : "bg-[#f2f2f2]! text-black!",
                globalSettings.fontFamily === "montserrat" ?
                  "font-[Montserrat,sans-serif]!"
                : "font-[Noto_Serif_JP,sans-serif]!",
              )}
              style={{
                fontSize: `${globalSettings.fontSize}px`,
              }}
            >
              {components.map((comp) => (
                <SortableItem
                  key={comp.id}
                  globalSettings={globalSettings}
                  comp={comp}
                  isSelected={selectedId === comp.id}
                  onSelect={onSelect}
                  onRemove={onRemove}
                />
              ))}{" "}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeComp ?
              <div className="p-3 rounded-md border bg-background shadow-lg">
                <ComponentPreview
                  globalSettings={globalSettings}
                  comp={activeComp}
                />
              </div>
            : null}
          </DragOverlay>
        </DndContext>
      }
    </div>
  );
}
