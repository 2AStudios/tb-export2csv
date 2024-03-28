import { getTotalMessages, downloadCSV } from "./modules/browser.js";
import {
  getSender,
  getPlainTextFromMessage,
  objectArrayToCSV,
} from "./modules/parser.js";

window.addEventListener("load", onLoad);

let folderSpan, totalSpan, currentSpan, progressBar, errorSpan, statusSpan;

let senders;

async function onLoad() {
  initializeUIElements();
  startParsingMessages();
}

function initializeUIElements() {
  folderSpan = document.getElementById("folder");
  totalSpan = document.getElementById("total");
  currentSpan = document.getElementById("current");
  progressBar = document.getElementById("progress");
  errorSpan = document.getElementById("error");
  statusSpan = document.getElementById("status");

  document
    .getElementById("button_download_csv")
    .addEventListener("click", handleDownloadCSV);
  document
    .getElementById("button_cancel")
    .addEventListener("click", handleClose);
}

async function handleClose(event) {
  await messenger.runtime.sendMessage({
    popupResponse: event.target.getAttribute("data"),
  });
  window.close();
}

async function handleDownloadCSV() {
  const csv = objectArrayToCSV({ data: senders });
  downloadCSV(csv);
}

async function startParsingMessages() {
  try {
    const tabsQueryInfo = {
      active: true,
    };

    statusSpan.textContent = "Starting..";

    const tabs = await messenger.mailTabs.query(tabsQueryInfo);

    // Gets the current displayed folder on the active tab on the active window
    const folder = tabs?.[0]?.displayedFolder;
    folderSpan.textContent = folder.name;

    statusSpan.textContent = "Getting Total Messages..";

    const messages = await getTotalMessages(folder);
    totalSpan.textContent = messages.length + "";

    statusSpan.textContent = "Fetching Messages..";
    senders = [];
    for (let i = 0; i < messages.length; i++) {
      const full = await messenger.messages.getFull(messages[i].id);

      senders.push({
        ...getSender(messages[i]),
        body: getPlainTextFromMessage(full),
      });

      currentSpan.textContent = i + 1 + "";
      progressBar.style.width =
        Math.ceil(((i + 1) / messages.length) * 100) + "%";
    }

    statusSpan.textContent = "Success! You can download csv.";
  } catch (e) {
    console.error(e);
    errorSpan.textContent = e;
  }
}
