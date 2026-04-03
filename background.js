console.log("Background service worker loaded.");

// Example: Run something when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    console.log("YouTube Subtitle Blocker Extension Installed!");
});


browser.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked!");
  console.log("Current tab:", tab);
  browser.tabs.sendMessage(tab.id, { action: "clicked" });
});