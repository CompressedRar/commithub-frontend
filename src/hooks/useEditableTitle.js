import { useState, useCallback } from "react";

/**
 * Manages inline contentEditable title toggling.
 *
 * @param {object} options
 * @param {string}   options.initialTitle - The title to reset to on cancel
 * @param {function} options.onSave       - async (title: string) => void
 * @param {object}   options.titleRef     - ref pointing to the contentEditable element
 */
export function useEditableTitle({ onSave, titleRef }) {
  const [titleEditable, setTitleEditable] = useState(false);

  const startEdit = useCallback(() => {
    setTitleEditable(true);
    // Defer focus so the element is rendered editable first
    setTimeout(() => titleRef.current?.focus(), 50);
  }, [titleRef]);

  const saveEdit = useCallback(async (pendingTitle) => {
    const trimmed = pendingTitle?.trim();
    if (trimmed) await onSave(trimmed);
    setTitleEditable(false);
  }, [onSave]);

  const cancelEdit = useCallback(() => {
    setTitleEditable(false);
  }, []);

  return { titleEditable, startEdit, saveEdit, cancelEdit };
}
