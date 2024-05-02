export async function importFromObservable(notebook, cell, version = "latest") {
  const { Runtime } = await import(
    "https://cdn.jsdelivr.net/npm/@observablehq/runtime@5/dist/runtime.js"
  );

  const { default: define } = await import(
    `https://api.observablehq.com/${notebook}@${version}.js?v=4`
  );

  const notebookVar = new Runtime().module(define, (name) => {
    return [cell].includes(name);
  });
  return notebookVar.value(cell);
}
