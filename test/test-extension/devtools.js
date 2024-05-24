chrome.devtools.panels.create(
  'Devtools test',
  'blank.png',
  'devtools.html',
  function (panel) {
    console.log('Custom DevTools panel created.')
  },
)
