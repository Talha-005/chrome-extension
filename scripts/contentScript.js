function runScript() {
  let ytLeftControls, ytPlayer;
  let currentVideo = "";
  let myYTbookmarks = [];

  const fetchMyBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  const newVideoLoaded = async () => {
    const isBookmarkBtn = document.getElementsByClassName("bookmark-btn")[0];
    if (!currentVideo) {
      let [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      const queryParams = activeTab.url.split("?")[1];
      const urlParams = new URLSearchParams(queryParams);
      currentVideo = urlParams.get("v");
    }

    myYTbookmarks = await fetchMyBookmarks();

    if (!isBookmarkBtn) {
      const newBtn = document.createElement("img");
      newBtn.src = chrome.runtime.getURL("../assets/bookmark.png");
      newBtn.className = "ytp-button bookmark-btn";
      newBtn.alt = "bookmark-btn";
      newBtn.title = "Click to bookmark current timestamp";
      newBtn.style.width = "40px";
      newBtn.style.height = "40px";
      newBtn.style.minWidth = "40px";

      ytLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
      ytPlayer = document.getElementsByClassName("video-stream")[0];

      ytLeftControls.appendChild(newBtn);
      newBtn.addEventListener("click", addNewBookmarkHandler);
    }
  };

  const addNewBookmarkHandler = async () => {
    const currentTime = ytPlayer.currentTime;
    const newObj = {
      time: currentTime,
      desc: `Bookmark at ${getTime(currentTime)}`,
    };
    myYTbookmarks = await fetchMyBookmarks();
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        [...myYTbookmarks, newObj].sort((a, b) => a.time - b.time),
      ),
    });
  };

  chrome.runtime.onMessage.addListener((obj, sender, resp) => {
    const { type, value, videoId } = obj;
    if (type === "NEW") {
      console.log("videoId:", videoId);
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      ytPlayer.currentTime = value;
    } else if (type === "DELETE") {
      myYTbookmarks = myYTbookmarks.filter((b) => b.time != value);
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(myYTbookmarks),
      });

      resp(myYTbookmarks);
    }
  });
}

runScript();

const getTime = (t) => {
  const date = new Date(0);
  date.setSeconds(t);
  return date.toISOString().substr(11, 8);
};
