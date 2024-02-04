import { getActiveTabURL } from "../utils/utils.js";

const addNewBookmark = (bookmarksElem, item) => {
  const bookmarkTitleElem = document.createElement("div");
  const controlsElem = document.createElement("div");
  const newBookmarkElem = document.createElement("div");

  bookmarkTitleElem.textContent = item.desc;
  bookmarkTitleElem.className = "bookmark-title";
  controlsElem.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controlsElem);
  setBookmarkAttributes("delete", onDelete, controlsElem);

  newBookmarkElem.id = "bookmark-" + item.time;
  newBookmarkElem.className = "bookmark";
  newBookmarkElem.setAttribute("timestamp", item.time);

  newBookmarkElem.appendChild(bookmarkTitleElem);
  newBookmarkElem.appendChild(controlsElem);
  bookmarksElem.appendChild(newBookmarkElem);
};

const viewBookmarks = (data = []) => {
  const bookmarksElem = document.getElementById("bookmarks");
  bookmarksElem.innerHTML = "";

  if (data.length > 0) {
    for (let item of data) {
      addNewBookmark(bookmarksElem, item);
    }
  } else {
    bookmarksElem.innerHTML = `<i class="row">No bookmarks to show</i>`;
  }
};

const onPlay = async (e) => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async (e) => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkElemToDelete = document.getElementById(
    "bookmark-" + bookmarkTime,
  );

//   bookmarkElemToDelete.parentNode.removeChild(bookmarkElemToDelete);

  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "DELETE",
      value: bookmarkTime,
    },
    viewBookmarks,
  );
};

const setBookmarkAttributes = (src, listener, controlParentElem) => {
  const controlElem = document.createElement("img");

  controlElem.src = "assets/" + src + ".png";
  controlElem.title = src;
  controlElem.addEventListener("click", listener);
  controlParentElem.appendChild(controlElem);
};

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();

  const queryParams = activeTab.url.split("?")[1];
  const urlParams = new URLSearchParams(queryParams);
  const currentVideo = urlParams.get("v");

  if (currentVideo && activeTab.url.includes("youtube.com/watch")) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentBookmarks = data[currentVideo]
        ? JSON.parse(data[currentVideo])
        : [];

      viewBookmarks(currentBookmarks);
    });
  } else {
    const container = document.getElementsByClassName("container")[0];
    container.innerHTML = `<div class="title">This is not a youtube video page.</div>`;
  }
});
