chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
    bounds: { width: 800, height: 600 },
    minHeight: 600,
    minWidth: 800,
    state: 'fullscreen',
  });
});
