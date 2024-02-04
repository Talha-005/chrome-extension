export const getActiveTabURL = async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
};
