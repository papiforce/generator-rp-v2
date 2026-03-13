"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  getCategories,
  getComponentsByCategory,
  TemplateComponentDefinition,
} from "@/lib/template-components";
import { ChevronDown, GripVertical } from "lucide-react";

interface ComponentListProps {
  onAddComponent: (type: string) => void;
}

function DraggableItem({
  def,
  onAddComponent,
}: {
  def: TemplateComponentDefinition;
  onAddComponent: (type: string) => void;
}) {
  const handleFixed = (fixed: TemplateComponentDefinition) => {
    switch (fixed) {
      case "last" as unknown as TemplateComponentDefinition:
        return "Dernier";
      case "draft" as unknown as TemplateComponentDefinition:
        return "Beta";
      default:
        return "Premier";
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("component-type", def.type);
        e.dataTransfer.effectAllowed = "copy";
      }}
      onClick={() => onAddComponent(def.type)}
      className="flex items-center gap-2 p-2 rounded-md border bg-background hover:bg-accent cursor-grab active:cursor-grabbing transition-colors text-sm"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      <span>{def.label}</span>
      {def.fixed && (
        <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {handleFixed(def.fixed as unknown as TemplateComponentDefinition)}
        </span>
      )}
    </div>
  );
}

export default function ComponentList({ onAddComponent }: ComponentListProps) {
  const categories = getCategories();

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-base font-semibold px-1">Composants</h2>
      {categories.map((cat) => {
        const components = getComponentsByCategory(cat);
        return (
          <Collapsible key={cat} defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium rounded-md hover:bg-accent transition-colors cursor-pointer">
              <span>{cat}</span>
              <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-1 pl-1 pt-1">
                {components.map((def) => (
                  <DraggableItem
                    key={def.type}
                    def={def}
                    onAddComponent={onAddComponent}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
