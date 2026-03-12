"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteSave, getSavesList, renameSave, slugify } from "@/lib/store";
import { Check, FolderOpen, Pencil, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface StartupModalProps {
  open: boolean;
  onLoadSave: (slug: string) => void;
  onCreateNew: (name: string) => void;
}

export default function StartupModal({
  open,
  onLoadSave,
  onCreateNew,
}: StartupModalProps) {
  const [mode, setMode] = useState<"choose" | "create">("choose");
  const [newName, setNewName] = useState("");
  const [saves, setSaves] = useState(() => getSavesList());
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const refreshSaves = () => setSaves(getSavesList());

  useEffect(() => {
    if (open) {
      setMode("choose");
      setNewName("");
      setEditingSlug(null);
      refreshSaves();
    }
  }, [open]);

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreateNew(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreate();
    }
  };

  const handleDelete = (slug: string) => {
    deleteSave(slug);
    refreshSaves();
  };

  const startEditing = (slug: string, currentName: string) => {
    setEditingSlug(slug);
    setEditName(currentName);
  };

  const confirmRename = () => {
    if (!editingSlug || !editName.trim()) return;
    renameSave(editingSlug, editName.trim());
    setEditingSlug(null);
    setEditName("");
    refreshSaves();
  };

  const cancelEditing = () => {
    setEditingSlug(null);
    setEditName("");
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-md [&>button]:hidden"
      >
        <DialogHeader>
          <DialogTitle>Template Builder</DialogTitle>
          <DialogDescription>
            Chargez une sauvegarde existante ou créez un nouveau template.
          </DialogDescription>
        </DialogHeader>

        {mode === "choose" ?
          <div className="flex flex-col gap-4">
            {saves.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">
                  Sauvegardes existantes
                </Label>
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                  {saves.map((save) =>
                    editingSlug === save.slug ?
                      <div
                        key={save.slug}
                        className="flex items-center gap-1.5 p-1.5 rounded-md border border-primary bg-accent"
                      >
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmRename();
                            if (e.key === "Escape") cancelEditing();
                          }}
                          className="h-8 text-sm flex-1"
                          autoFocus
                        />
                        <button
                          onClick={confirmRename}
                          disabled={!editName.trim()}
                          className="shrink-0 p-1.5 rounded hover:bg-primary/10 text-primary transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="shrink-0 p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    : <div
                        key={save.slug}
                        className="flex items-center gap-2 p-2.5 rounded-md border hover:bg-accent transition-colors group"
                      >
                        <button
                          onClick={() => onLoadSave(save.slug)}
                          className="flex items-center gap-2 flex-1 min-w-0 text-left text-sm cursor-pointer"
                        >
                          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{save.name}</span>
                        </button>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(save.slug, save.name);
                            }}
                            className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(save.slug);
                            }}
                            className="shrink-0 p-1 rounded hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>,
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={() => setMode("create")}
              variant={saves.length > 0 ? "outline" : "default"}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle sauvegarde
            </Button>
          </div>
        : <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="template-name">Nom du template</Label>
              <Input
                id="template-name"
                placeholder="Mon Super Template"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              {newName.trim() && (
                <p className="text-xs text-muted-foreground">
                  Clé :{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    {slugify(newName)}
                  </code>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setMode("choose")}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1"
              >
                Créer
              </Button>
            </div>
          </div>
        }
      </DialogContent>
    </Dialog>
  );
}
