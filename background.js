const NOTIFICATIONS_URL = "https://www.linkedin.com/notifications";

function isNotificationsPage(url) {
  try {
    const pageUrl = new URL(url);

    return (
      pageUrl.origin === "https://www.linkedin.com" &&
      pageUrl.pathname.startsWith("/notifications")
    );
  } catch {
    return false;
  }
}

async function updateActionState(tab) {
  if (!tab.id) {
    return;
  }

  if (isNotificationsPage(tab.url)) {
    await chrome.action.enable(tab.id);
    return;
  }

  await chrome.action.disable(tab.id);
}

async function updateAllActionStates() {
  const tabs = await chrome.tabs.query({});

  await Promise.all(tabs.map(updateActionState));
}

chrome.runtime.onInstalled.addListener(updateAllActionStates);
chrome.runtime.onStartup.addListener(updateAllActionStates);

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  await updateActionState(tab);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    await updateActionState(tab);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !isNotificationsPage(tab.url)) {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
});
