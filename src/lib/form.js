// Shared browser-side wiring for the calculator forms.

/**
 * Restore a form from the query string so a shared link reproduces the estimate.
 * Unchecked boxes are absent from the query string, so they are cleared first.
 * Returns true if anything was restored.
 */
export function restoreFromQuery(form) {
  if (!location.search) return false;
  for (const box of form.querySelectorAll('input[type=checkbox]')) box.checked = false;
  for (const [key, value] of new URLSearchParams(location.search)) {
    const field = form.elements.namedItem(key);
    if (!field) continue;
    if (field.type === 'checkbox') field.checked = true;
    else field.value = value;
  }
  return true;
}

/** Mirror the form into the URL without adding history entries. */
export const syncToQuery = (form) =>
  history.replaceState(null, '', `?${new URLSearchParams(new FormData(form))}`);

/** Copy button that confirms itself and reverts. */
export function wireCopy(button, getText) {
  button.addEventListener('click', async () => {
    const text = getText();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    const original = button.textContent;
    button.textContent = 'Copied';
    setTimeout(() => (button.textContent = original), 2000);
  });
}
