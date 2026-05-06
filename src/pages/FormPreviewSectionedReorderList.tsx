import type { Dispatch, FC, SetStateAction } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import type { AttributeDefinition, ObjectSchema } from "../types/attribute.js";
import { riskSchema } from "../features/schemaViewer/sampleData.js";
import { AttributeListRow } from "../features/schemaManagement/components/AttributeListRow.js";
import { SortableAttributeRow } from "../features/schemaManagement/components/SortableCustomAttributeList.js";
import { STR } from "../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../utils/uiDividerBorder.js";
import { partitionCustomAttributesBySchemaSections } from "./formPreviewShared.js";

const SECTION_EMPTY_PREFIX = "section-empty-";
const SECTION_TAIL_PREFIX = "section-tail-";

function isEmptyDroppableId(id: string) {
  return id.startsWith(SECTION_EMPTY_PREFIX);
}

function isTailDroppableId(id: string) {
  return id.startsWith(SECTION_TAIL_PREFIX);
}

function sectionIdFromEmptyDroppable(id: string) {
  return id.slice(SECTION_EMPTY_PREFIX.length);
}

function sectionIdFromTailDroppable(id: string) {
  return id.slice(SECTION_TAIL_PREFIX.length);
}

type SectionGroup = { id: string; name: string; attributes: AttributeDefinition[] };

function findSectionIdForAttributeId(groups: SectionGroup[], attrId: string): string | null {
  for (const g of groups) {
    if (g.attributes.some((a) => a.id === attrId)) return g.id;
  }
  return null;
}

function flattenFromGroups(groups: SectionGroup[]): AttributeDefinition[] {
  return groups.flatMap((g) => g.attributes);
}

function cloneGroups(groups: SectionGroup[]): SectionGroup[] {
  return groups.map((g) => ({ ...g, attributes: [...g.attributes] }));
}

/**
 * Removes the attribute from its current section bucket and inserts it into `toSectionId`
 * at `targetIndex` (0-based within the target list before insert).
 */
function buildCrossSectionDraft(
  prev: AttributeDefinition[],
  activeId: string,
  toSectionId: string,
  targetIndexInTargetSection: number,
  schema: ObjectSchema,
): AttributeDefinition[] {
  const groups = cloneGroups(partitionCustomAttributesBySchemaSections(prev, schema));
  const activeSection = findSectionIdForAttributeId(groups, activeId);
  if (!activeSection) return prev;

  const fromIdx = groups.findIndex((g) => g.id === activeSection);
  const toIdx = groups.findIndex((g) => g.id === toSectionId);
  if (fromIdx < 0 || toIdx < 0) return prev;

  const fromList = groups[fromIdx].attributes;
  const pullIdx = fromList.findIndex((a) => a.id === activeId);
  if (pullIdx < 0) return prev;
  const [moved] = fromList.splice(pullIdx, 1);
  const updated: AttributeDefinition = { ...moved, sectionId: toSectionId };
  const toList = groups[toIdx].attributes;
  const insertAt = Math.min(Math.max(0, targetIndexInTargetSection), toList.length);
  toList.splice(insertAt, 0, updated);
  return flattenFromGroups(groups);
}

type PendingMove = {
  attributeName: string;
  fromSectionName: string;
  toSectionName: string;
  nextDraft: AttributeDefinition[];
};

const noop = () => {};

interface SectionEmptyDropZoneProps {
  sectionId: string;
}

const SectionEmptyDropZone: FC<SectionEmptyDropZoneProps> = ({ sectionId }) => {
  const id = `${SECTION_EMPTY_PREFIX}${sectionId}`;
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Box
      ref={setNodeRef}
      sx={({ tokens }) => ({
        minHeight: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        borderRadius: 1,
        border: "1px dashed",
        borderColor: uiDividerDefaultBorderColor(tokens),
        bgcolor: isOver ? tokens.semantic.color.surface?.subtle?.value ?? "action.hover" : "transparent",
        color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
      })}
    >
      <Typography variant="body2" textAlign="center">
        {STR.formPreview.reorderSheetEmptySectionHint}
      </Typography>
    </Box>
  );
};

interface SectionTailDropZoneProps {
  sectionId: string;
}

const SectionTailDropZone: FC<SectionTailDropZoneProps> = ({ sectionId }) => {
  const id = `${SECTION_TAIL_PREFIX}${sectionId}`;
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Box
      ref={setNodeRef}
      aria-hidden
      sx={({ tokens }) => ({
        minHeight: 12,
        mx: -0.5,
        borderRadius: 1,
        bgcolor: isOver ? tokens.semantic.color.surface?.subtle?.value ?? "action.hover" : "transparent",
      })}
    />
  );
};

interface Props {
  draft: AttributeDefinition[];
  setDraft: Dispatch<SetStateAction<AttributeDefinition[]>>;
  /** Defaults to Risk sample schema (form preview). */
  schema?: ObjectSchema;
}

/**
 * Section-grouped drag reorder for the form preview sheet. Reorders within a section immediately;
 * cross-section drags open a confirmation dialog before updating `sectionId` and order.
 */
export const FormPreviewSectionedReorderList: FC<Props> = ({ draft, setDraft, schema = riskSchema }) => {
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const groups = useMemo(() => partitionCustomAttributesBySchemaSections(draft, schema), [draft, schema]);

  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const activeDragAttribute = useMemo(
    () => (activeDragId ? draft.find((a) => a.id === activeDragId) ?? null : null),
    [activeDragId, draft],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;
      if (!over) return;
      const activeId = String(active.id);
      const overId = String(over.id);
      if (activeId === overId) return;

      const prev = draftRef.current;
      const g0 = partitionCustomAttributesBySchemaSections(prev, schema);
      const activeSection = findSectionIdForAttributeId(g0, activeId);
      if (!activeSection) return;

      let overSection: string | null = null;

      if (isEmptyDroppableId(overId)) {
        overSection = sectionIdFromEmptyDroppable(overId);
      } else if (isTailDroppableId(overId)) {
        overSection = sectionIdFromTailDroppable(overId);
      } else {
        overSection = findSectionIdForAttributeId(g0, overId);
      }

      if (!overSection) return;

      if (activeSection === overSection) {
        if (isEmptyDroppableId(overId)) return;
        const section = g0.find((k) => k.id === activeSection);
        if (!section) return;
        const oldIndex = section.attributes.findIndex((a) => a.id === activeId);
        if (oldIndex < 0) return;
        let newIndex: number;
        if (isTailDroppableId(overId)) {
          newIndex = section.attributes.length - 1;
        } else {
          newIndex = section.attributes.findIndex((a) => a.id === overId);
        }
        if (newIndex < 0 || oldIndex === newIndex) return;
        const nextAttrs = arrayMove(section.attributes, oldIndex, newIndex);
        const nextGroups = g0.map((g) => (g.id === activeSection ? { ...g, attributes: nextAttrs } : g));
        setDraft(flattenFromGroups(nextGroups));
        return;
      }

      // Cross-section
      const attr = prev.find((a) => a.id === activeId);
      if (!attr) return;
      const fromG = g0.find((g) => g.id === activeSection);
      const toG = g0.find((g) => g.id === overSection);
      if (!fromG || !toG) return;

      let insertIndex: number;
      if (isTailDroppableId(overId)) {
        insertIndex = toG.attributes.length;
      } else if (isEmptyDroppableId(overId)) {
        insertIndex = 0;
      } else {
        const idx = toG.attributes.findIndex((a) => a.id === overId);
        insertIndex = idx >= 0 ? idx : toG.attributes.length;
      }

      const nextDraft = buildCrossSectionDraft(prev, activeId, overSection, insertIndex, schema);
      setPendingMove({
        attributeName: attr.name,
        fromSectionName: fromG.name,
        toSectionName: toG.name,
        nextDraft,
      });
    },
    [schema, setDraft],
  );

  const handleConfirmMove = useCallback(() => {
    if (!pendingMove) return;
    setDraft(pendingMove.nextDraft);
    setPendingMove(null);
  }, [pendingMove, setDraft]);

  const handleDismissDialog = useCallback(() => {
    setPendingMove(null);
  }, []);

  const dragOverlayHandle = (
    <Box
      aria-hidden
      sx={({ tokens }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        flexShrink: 0,
        color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
      })}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "3px", py: 0.5 }}>
        <Box sx={{ width: 14, height: 2, borderRadius: 1, bgcolor: "currentColor" }} />
        <Box sx={{ width: 14, height: 2, borderRadius: 1, bgcolor: "currentColor" }} />
        <Box sx={{ width: 14, height: 2, borderRadius: 1, bgcolor: "currentColor" }} />
      </Box>
    </Box>
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <Stack spacing={2.5} sx={{ px: 0, py: 0 }}>
          {groups.map((section) => (
            <Box key={section.id}>
              <Box
                component="header"
                sx={({ tokens }) => ({
                  px: 0,
                  py: 1,
                  bgcolor: tokens.semantic.color.surface?.subtle?.value ?? "action.hover",
                })}
              >
                <Typography
                  component="h3"
                  variant="subtitle2"
                  sx={({ tokens }) => ({
                    fontWeight: 600,
                    letterSpacing: 0.2,
                    color: tokens.semantic.color.type?.default?.value ?? "text.primary",
                  })}
                >
                  {STR.formPreview.reorderSheetSectionHeading(section.name)}
                </Typography>
              </Box>
              {section.attributes.length === 0 ? (
                <Box sx={{ py: 0.5 }}>
                  <SectionEmptyDropZone sectionId={section.id} />
                </Box>
              ) : (
                <>
                  <SortableContext
                    id={section.id}
                    items={section.attributes.map((a) => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Box sx={{ overflow: "hidden" }}>
                      {section.attributes.map((attr) => (
                        <SortableAttributeRow
                          key={attr.id}
                          id={attr.id}
                          attribute={attr}
                          dragHandleLabel={STR.schemaManagement.dragHandleReorder}
                          draggingSourceOpacity={0.34}
                          onEdit={noop}
                        />
                      ))}
                    </Box>
                  </SortableContext>
                  <SectionTailDropZone sectionId={section.id} />
                </>
              )}
            </Box>
          ))}
        </Stack>

        <DragOverlay dropAnimation={null}>
          {activeDragAttribute ? (
            <Box
              sx={({ tokens, shadows }) => ({
                width: "min(calc(100vw - 48px), 672px)",
                maxWidth: "100%",
                boxShadow: shadows[12],
                borderRadius: 1,
                border: "none",
                bgcolor: tokens.semantic.color.surface?.default?.value ?? "background.paper",
                cursor: "grabbing",
              })}
            >
              <AttributeListRow
                attribute={activeDragAttribute}
                dragHandle={dragOverlayHandle}
                suppressRowActions
                onEdit={noop}
              />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Dialog
        open={pendingMove != null}
        onClose={handleDismissDialog}
        aria-labelledby="form-preview-move-section-dialog-title"
      >
        <DialogTitle id="form-preview-move-section-dialog-title">
          {STR.formPreview.moveAttributeSectionDialogTitle}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {pendingMove
              ? STR.formPreview.moveAttributeSectionDialogBody(
                  pendingMove.attributeName,
                  pendingMove.fromSectionName,
                  pendingMove.toSectionName,
                )
              : null}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" color="primary" onClick={handleDismissDialog}>
            {STR.form.cancel}
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirmMove}>
            {STR.formPreview.moveAttributeSectionConfirm}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
