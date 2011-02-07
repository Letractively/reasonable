const re = /(facebook|twitter)/;

function blockScripts(event) {
  if (event.target.nodeName.toUpperCase() === "IFRAME") {
    if (re.test(event.target.src)) {
      event.preventDefault();
    }
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