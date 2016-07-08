function init() {
  var showsHeading = document.getElementById('shows-heading');
  showsHeading.addEventListener("click", toggleShows);
  var otherHeading = document.getElementById('other-heading');
  otherHeading.addEventListener("click", toggleOther);
}

window.onload = init;
