document.addEventListener(
  'keydown',
  function handleKeyDown(event) {
    var keyCode = event.keyCode;

    // Ignore keydown event if typing in an input box
    if (
      (document.activeElement.nodeName === 'INPUT' && document.activeElement.getAttribute('type') === 'text') ||
      document.activeElement.nodeName === 'TEXTAREA' ||
      document.activeElement.isContentEditable
    ) {
      return false;
    }

    var port = chrome.runtime.connect();

    //m
    if (keyCode === 77) {
      port.onMessage.addListener(function(message, sender) {
        port.postMessage({ type: 'toggleMute' });
      });
    }
    //shift+alt+p
    if (keyCode === 80 && event.altKey && event.shiftKey) {
      port.onMessage.addListener(function(message, sender) {
        port.postMessage({ type: 'popDown' });
      });
    }
  },
  true
);

window.onbeforeunload = function() {
  chrome.runtime.sendMessage({ type: 'closeMe' });
};
