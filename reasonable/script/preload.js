function blockScripts(event) {
  if (event.target.nodeName.toUpperCase() === "IFRAME") {
    event.preventDefault();
  }
}

function main() {
  chrome.extension.sendRequest({"type": "blockIframes"}, function(response) {
    // Block iframes if set
    if (response == "true" || response == true) {
      document.addEventListener("beforeload", blockScripts, true);
    }
  }
}

main();