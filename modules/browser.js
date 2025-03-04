export async function* getMessages(folder) {
  let page = await messenger.messages.list(folder);
  for (let message of page.messages) {
    yield message;
  }

  while (page.id) {
    page = await messenger.messages.continueList(page.id);
    for (let message of page.messages) {
      yield message;
    }
  }
}

export async function getTotalMessages(folder) {
  let page = await messenger.messages.list(folder.id);
  const messages = page.messages;

  while (page.id) {
    page = await messenger.messages.continueList(page.id);
    messages.push(...page.messages);
  }

  return messages;
}

export function downloadCSV(csv, folderName) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const filename = folderName ? `${folderName}.csv` : "export.csv";

  messenger.downloads.download({
    url: URL.createObjectURL(blob),
    filename: filename,
    saveAs: true,
  });
}
