const grid = document.getElementById("grid");

chrome.storage.sync.get(["showGrid"]).then(p => {
  grid.checked = p.showGrid ?? true;});
function save() {
  chrome.storage.sync.set({
  showGrid: grid.checked, });}
grid.addEventListener("change", save);

