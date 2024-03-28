async function awaitPopup() {
  async function popupPrompt(popupId, defaultResponse) {
    try {
      await messenger.windows.get(popupId);
    } catch (e) {
      // Window does not exist, assume closed.
      return defaultResponse;
    }

    return new Promise((resolve) => {
      let response = defaultResponse;
      function windowRemoveListener(closedId) {
        if (popupId == closedId) {
          messenger.windows.onRemoved.removeListener(windowRemoveListener);
          messenger.runtime.onMessage.removeListener(messageListener);
          resolve(response);
        }
      }
      function messageListener(request, sender, sendResponse) {
        if (sender.tab.windowId != popupId || !request) {
          return;
        }

        if (request.popupResponse) {
          response = request.popupResponse;
        }
        if (request.ping) {
          console.log("Background ping");
        }
      }
      messenger.runtime.onMessage.addListener(messageListener);
      messenger.windows.onRemoved.addListener(windowRemoveListener);
    });
  }

  let window = await messenger.windows.create({
    url: "popup.html",
    type: "popup",
    height: 280,
    width: 500,
    allowScriptsToClose: true,
  });

  // Wait for the popup to be closed and define a default return value if the
  // window is closed without clicking a button.
  await popupPrompt(window.id, "cancel");
}

function initialize() {
  browser.runtime.onInstalled.addListener(() => {
    browser.menus.create(
      {
        id: "action_save_as_csv",
        title: browser.i18n.getMessage("save_as_csv"),
        contexts: ["folder_pane"],
      },
      handleCreated
    );
  });

  browser.menus.onClicked.addListener((info) => {
    switch (info.menuItemId) {
      case "action_save_as_csv":
        awaitPopup();
        break;
    }
  });
}

function handleCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Menu item created successfully");
  }
}

initialize();
