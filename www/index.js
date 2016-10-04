function updatePlayingSong(audioPlayer, musicmode, starts, ends) {
  var time = audioPlayer.currentTime;
  var songPlaying = false;
  for (var i=0; i<ends.length; i++) {
    // The track at index i is currentply playing
    if ((time >= starts[i]) && (time <= ends[i])) {
      songPlaying = true;
      var tracks = document.querySelectorAll("#tracklist li .track");
      for (var j=0; j<tracks.length; j++) {
        if (j == i) {
          tracks[j].classList.add("selected");
        } else {
          tracks[j].classList.remove("selected");
        }
      }
    // The stream is between tracks and the user has chosen to skip these parts
    } else if (musicmode.classList.contains("on") && (i<ends.length-1) &&
        (time > ends[i]) && (time < starts[i+1])) {
      audioPlayer.currentTime = starts[i+1];
    }
  }
  if (!songPlaying) {
    var selected = document.querySelector("#tracklist li .selected");
    if (selected) {
      selected.classList.remove("selected");
    }
  }
  setTimeout(updatePlayingSong, 1000, audioPlayer, musicmode, starts, ends);
}

window.onload = function() {
  // Show yesscript tags (invisible by default for non-js users)
  var yesscripts = document.getElementsByTagName('yesscript');
  for (var i=0; i<yesscripts.length; i++) {
    yesscripts[i].style.display = "inherit";
  };
  // Set up timestamps and music-mode button to be clickable
  var timestamps = document.getElementsByClassName('timestamp');
  var audioPlayer = document.getElementsByTagName("audio")[0];
  for (var i=0; i<timestamps.length; i++) {
    timestamps[i].classList.add("clickable");
    timestamps[i].addEventListener("click", function() {
      var minutes = parseInt(this.innerText.slice(0, 2));
      var seconds = parseInt(this.innerText.slice(-2));
      audioPlayer.currentTime = minutes*60 + seconds;
    });
  };
  var musicmode = document.getElementById("musicmode");
  if (musicmode) {
    musicmode.addEventListener("click", function() {
      this.classList.toggle("on");
    });
  }
  // Show audio-seeking warning for Firefox users
  if (audioPlayer && (navigator.userAgent.toLowerCase().indexOf('firefox')>-1)){
    var warning = document.createElement('div');
    warning.id = "description";
    warning.innerText = "Note: audio seeking times in Firefox aren't " +
      "perfect; click this button to jump back 10 seconds: ";
    var rewind = document.createElement('span');
    rewind.classList.add("clickable");
    rewind.innerText = "⟳";
    rewind.addEventListener("click", function() {
      audioPlayer.currentTime -= 10;
      if (musicmode.classList.contains("on")) {
        musicmode.classList.remove("on");
        setTimeout(function() { musicmode.classList.add("on"); }, 20000);
      }
    });
    warning.appendChild(rewind);
    audioPlayer.parentNode.insertBefore(
      warning, document.getElementById("tracklist")
    );
  }

  // Read track timing info and start updating the current track / skipping
  // talking
  if (audioPlayer) {
    var startsEndsRequest = new XMLHttpRequest();
    startsEndsRequest.onreadystatechange = function() {
      if (startsEndsRequest.readyState == XMLHttpRequest.DONE) {
        if (startsEndsRequest.status == 200 && startsEndsRequest.response) {
          startsEnds = JSON.parse(startsEndsRequest.responseText);
          updatePlayingSong(
            audioPlayer, musicmode, startsEnds.starts, startsEnds.ends
          );
        } else {
          console.log(startsEndsRequest.status);
          console.log(startsEndsRequest.responseText);
          alert('Failed to read the starts-ends info.');
        }
      }
    }
    startsEndsRequest.open('GET', 'starts_ends.json');
    startsEndsRequest.send(null);
  }
};
