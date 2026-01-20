import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import type { ResizeHandleProps } from "./types";

/**
 * Draggable resize handle for split panels
 */
export function ResizeHandle({
  orientation,
  onResizeStart,
  onResize,
  onResizeEnd,
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startPosRef.current = orientation === "vertical" ? e.clientX : e.clientY;
      onResizeStart();
    },
    [orientation, onResizeStart]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = orientation === "vertical" ? e.clientX : e.clientY;
      const delta = currentPos - startPosRef.current;
      startPosRef.current = currentPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onResizeEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, orientation, onResize, onResizeEnd]);

  return (
    <div
      className={cn(
        "group relative flex items-center justify-center transition-colors",
        orientation === "vertical"
          ? "w-2 cursor-col-resize hover:bg-primary/20"
          : "h-2 cursor-row-resize hover:bg-primary/20",
        isDragging && "bg-primary/30"
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Visual indicator */}
      <div
        className={cn(
          "rounded-full bg-muted-foreground/30 transition-all group-hover:bg-primary/50",
          orientation === "vertical" ? "h-8 w-1" : "w-8 h-1",
          isDragging && "bg-primary"
        )}
      />
      {/* Invisible larger hit area */}
      <div
        className={cn(
          "absolute",
          orientation === "vertical"
            ? "inset-y-0 -left-1 -right-1"
            : "inset-x-0 -top-1 -bottom-1"
        )}
      />
    </div>
  );
}
