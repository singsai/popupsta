(function() {
  var Utility = {
    modals: {},
    toggleMute: function(tabId) {
      if (Utility.modals[tabId]) {
        Utility.modals[tabId].muted = !Utility.modals[tabId].muted;

        chrome.tabs.update(tabId, { muted: Utility.modals[tabId].muted });
      }
    },
    isModal: function(tabId) {
      return Utility.modals[tabId] && Utility.modals[tabId].type === 'popup';
    },
    storeTab: function(tabId) {
      Utility.modals[tabId] = { muted: false, type: 'popup' };
    }
  };

  function saveSizeSettings(url, tab) {
    var baseURL = new URL(url).hostname;
    var previousWindowSizes = {};
    previousWindowSizes[baseURL] = tab;

    chrome.storage.sync.set(previousWindowSizes); //Store size settings based on url
  }

  function showNotification(tabId) {
    new Notification('', {
      icon: 'icons/icon48.png',
      body: `The popup is now ${Utility.modals[tabId].muted ? 'muted' : 'unmuted'}`
    });
  }

  chrome.browserAction.onClicked.addListener(function(tab) {
    var baseURL = new URL(tab.url).hostname;

    var defaultSizeSettings = {
      width: window.screen.width * 0.8,
      height: window.screen.height * 0.8
    };

    chrome.storage.sync.get(baseURL, function(storage) {
      if (storage && storage[baseURL]) {
        defaultSizeSettings.width = storage[baseURL].width;
        defaultSizeSettings.height = storage[baseURL].height;
      }

      chrome.windows.create({
        tabId: tab.id,
        type: 'popup',
        width: defaultSizeSettings.width,
        height: defaultSizeSettings.height
      });

      Utility.storeTab(tab.id);
    });
  });

  chrome.runtime.onConnect.addListener(function(port) {
    // Send data through port
    port.postMessage({ status: 'connected' });

    // Wait for incoming message
    port.onMessage.addListener(function(message, sender) {
      var tabId = sender.sender.tab.id;

      if (message.type === 'toggleMute') {
        Utility.toggleMute(tabId);
        showNotification(tabId);
      }

      if (message.type === 'popDown' && Utility.isModal(tabId)) {
        chrome.windows.create({
          tabId: tabId,
          type: 'normal'
        });
        Utility.modals[tabId].type = 'normal';
      }
    });
  });

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // Wait for connection from content script
    var tab = sender.tab;

    if (message.type === 'closeMe' && Utility.isModal(tab.id)) {
      saveSizeSettings(tab.url, {
        width: tab.width,
        height: tab.height
      });
    }
  });

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-109025094-1']);
  _gaq.push(['_trackPageview']);

  document.addEventListener('DOMContentLoaded', function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
  });
})();
