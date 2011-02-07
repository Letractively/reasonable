function blockScripts(event) {
  if (event.target.nodeName.toUpperCase() === "IFRAME") {
    event.preventDefault();
  }
}

function main() {
  chrome.extension.sendRequest({"type": "blockIframes"}, function(response) {
    // Block iframes unless turned off
    if (response != false && response != "false") {
      document.addEventListener("beforeload", blockScripts, true);
    }
  });
}

main();