"use client";
import { useEffect, useRef, type ReactNode } from "react";

export default function EditorDialog({ title, onClose, children }: {title: string; onClose: () => void; children: ReactNode}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={ref} className="project-dialog" aria-label={title} onCancel={event => {event.preventDefault(); onClose();}} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose();
  }}><div className="editor-heading"><h2>{title}</h2><button className="dialog-close" type="button" aria-label="Close dialog" onClick={onClose}>&times;</button></div>{children}</dialog>;
}
