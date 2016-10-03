var showEntries;
var artistTrackUrls;

function removeElement(e) {
  e.parentNode.removeChild(e);
}

function getShowEntries(callback) {
  if (showEntries) {
    callback(showEntries);
  } else {
    var showEntriesRequest = new XMLHttpRequest();
    showEntriesRequest.onreadystatechange = function() {
      if (showEntriesRequest.readyState == XMLHttpRequest.DONE) {
        if (showEntriesRequest.status == 200 && showEntriesRequest.response) {
          showEntries = JSON.parse(showEntriesRequest.responseText);
          callback(showEntries);
        } else {
          console.log(showEntriesRequest.status);
          console.log(showEntriesRequest.responseText);
          alert('Failed to read the show entries.');
        }
      }
    }
    showEntriesRequest.open('GET', 'show_entries.json');
    showEntriesRequest.send(null);
  }
}

function getArtistTrackUrls(callback) {
  if (artistTrackUrls) {
    callback(artistTrackUrls);
  } else {
    var artistTrackUrlsRequest = new XMLHttpRequest();
    artistTrackUrlsRequest.onreadystatechange = function() {
      if (artistTrackUrlsRequest.readyState == XMLHttpRequest.DONE) {
        if (artistTrackUrlsRequest.status == 200 && artistTrackUrlsRequest.response) {
          artistTrackUrls = JSON.parse(artistTrackUrlsRequest.responseText);
          callback(artistTrackUrls);
        } else {
          console.log(artistTrackUrlsRequest.status);
          console.log(artistTrackUrlsRequest.responseText);
          alert('Failed to read the artist and track information.');
        }
      }
    }
    artistTrackUrlsRequest.open('GET', 'artist_track_urls.json');
    artistTrackUrlsRequest.send(null);
  }
}

function makeEntryLinks(links) {
  var entryLinks = document.createElement('div');
  entryLinks.classList.add('entry-links');
  for (var i=0; i<links.length; i++) {
    var linkElem = document.createElement('a');
    linkElem.href = links[i].url;
    linkElem.innerHTML = links[i].text;
    entryLinks.appendChild(linkElem);
    entryLinks.innerHTML += ' | ';
  }
  entryLinks.innerHTML = entryLinks.innerHTML.slice(0,-3);
  return entryLinks;
}

function makeEntryAudioPlayer(streamLink) {
  var audioPlayer = document.createElement('audio');
  audioPlayer.controls = "controls";
  var audioSource = document.createElement('source');
  audioSource.src = streamLink;
  audioPlayer.appendChild(audioSource);
  return audioPlayer;
}

function makeEntryMusicModeToggle(audioPlayer, tracklist) {
  var toggleElem = document.createElement('div');
  var musicModeElem = document.createElement('div');
  var checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  musicModeElem.appendChild(checkbox);
  musicModeElem.appendChild(document.createTextNode("♫-only mode"));
  toggleElem.appendChild(musicModeElem);
  var starts = tracklist.map(function(entry) {
    return entry.start_minutes*60 + entry.start_seconds;
  });
  var ends = tracklist.map(function(entry) {
    return entry.end_minutes*60 + entry.end_seconds;
  });
  var skipTalking = function(i) {
    if (document.body.contains(audioPlayer) && (i < (ends.length - 1))) {
      if (checkbox.checked) {
        var time = audioPlayer.currentTime;
        var start_i = i;
        while ((i < ends.length) && (time > ends[i])) {
          i += 1;
        }
        if ((i != start_i) && (i < ends.length) && (time < starts[i])) {
          audioPlayer.currentTime = starts[i];
        }
      }
      setTimeout(skipTalking, 1000, i);
    }
  };
  setTimeout(skipTalking, 1000, 0);
  return toggleElem;
}

function makeEntryTracklistEntry(tracklistEntry, artistTrackUrls) {
  var tracklistEntryElem = document.createElement('li');
  tracklistEntryElem.classList.add('tracklist-entry');
  if (tracklistEntry.start_minutes !== undefined) {
    var timestampElem = document.createElement('span');
    timestampElem.classList.add('timestamp');
    timestampElem.innerHTML = tracklistEntry.start_minutes + ':';
    timestampElem.innerHTML += tracklistEntry.start_seconds >= 10
      ? tracklistEntry.start_seconds
      : '0' + tracklistEntry.start_seconds;
    timestampElem.addEventListener("click", function() {
      var tracklistElem = this.parentNode.parentNode;
      var audioPlayer = tracklistElem.previousSibling.previousSibling;
      var time = tracklistEntry.start_minutes*60 + tracklistEntry.start_seconds;
      audioPlayer.currentTime = time;
    });
    tracklistEntryElem.appendChild(timestampElem);
    tracklistEntryElem.appendChild(document.createTextNode(' | '));
  }
  var artistUrl = artistTrackUrls[tracklistEntry.artist].url;
  var trackUrls = artistTrackUrls[tracklistEntry.artist].tracks;
  var trackUrl = trackUrls[tracklistEntry.title];
  if (artistUrl === "") {
    var artistText = document.createTextNode(tracklistEntry.artist);
    tracklistEntryElem.appendChild(artistText);
  } else {
    var artistElem = document.createElement('a');
    artistElem.href = artistUrl;
    artistElem.innerHTML = tracklistEntry.artist;
    tracklistEntryElem.appendChild(artistElem);
  }
  tracklistEntryElem.appendChild(document.createTextNode(' - '));
  if (trackUrl === "") {
    var titleText = document.createTextNode(tracklistEntry.title);
    tracklistEntryElem.appendChild(titleText);
  } else {
    var titleElem = document.createElement('a');
    titleElem.href = trackUrl;
    titleElem.innerHTML = tracklistEntry.title;
    tracklistEntryElem.appendChild(titleElem);
  }
  return tracklistEntryElem;
}

function makeEntryTracklist(tracklist, artistTrackUrls) {
  var tracklistElem = document.createElement('ol');
  tracklistElem.classList.add('tracklist');
  for (var i=0; i<tracklist.length; i++) {
    var tracklistEntryElem = makeEntryTracklistEntry(
      tracklist[i], artistTrackUrls
    );
    tracklistElem.appendChild(tracklistEntryElem);
  }
  return tracklistElem;
}

function makeEntryContent(entry, artistTrackUrls) {
  var entryContent = document.createElement('div');
  entryContent.classList.add('entry-content');
  var entryLinks = makeEntryLinks(entry.links);
  entryContent.appendChild(entryLinks);
  if (entry.stream) {
    var entryAudioPlayer = makeEntryAudioPlayer(entry.stream);
    entryContent.appendChild(entryAudioPlayer);
    var entryMusicModeToggle = makeEntryMusicModeToggle(
      entryAudioPlayer, entry.tracklist
    );
    entryContent.appendChild(entryMusicModeToggle);
  }
  var entryTracklist = makeEntryTracklist(entry.tracklist, artistTrackUrls);
  entryContent.appendChild(entryTracklist);
  return entryContent;
}

function toggleEntry(entry, entryElem) {
  var entryHeading = entryElem.querySelector('.entry-heading');
  var entryContent = entryElem.querySelector('.entry-content');
  if (entryContent) {
    entryHeading.innerHTML = '+' + entryHeading.innerHTML.slice(1);
    entryElem.removeChild(entryContent);
  } else {
    entryHeading.innerHTML = '-' + entryHeading.innerHTML.slice(1);
    getArtistTrackUrls(function(artistTrackUrls) {
      entryContent = makeEntryContent(entry, artistTrackUrls);
      entryElem.appendChild(entryContent);
    });
  }
}

function makeShowEntryHeading(entry, entryElem) {
  var entryHeading = document.createElement('div');
  entryHeading.classList.add('entry-heading');
  entryHeading.innerHTML = '+ ' + entry.number + ': ' + entry.title;
  entryHeading.innerHTML += ' (' + entry.date + ')';
  entryHeading.addEventListener("click", function () {
    toggleEntry(entry, entryElem);
  });
  return entryHeading;
}

function appendShowEntryHeadings(parentNode) {
  var entriesElem = document.createElement('div');
  entriesElem.classList.add('entries');
  getShowEntries(function(showEntries) {
    for (var i=0; i<showEntries.length; i++) {
      var entryElem = document.createElement('div');
      entryElem.classList.add('entry');
      var entryHeading = makeShowEntryHeading(showEntries[i], entryElem);
      entryElem.appendChild(entryHeading);
      entriesElem.appendChild(entryElem);
    }
    parentNode.appendChild(entriesElem);
  });
}

function toggleShows() {
  if (this.nextElementSibling) {
    this.innerHTML = '+' + this.innerHTML.slice(1);
    removeElement(this.nextElementSibling);
  } else {
    this.innerHTML = '-' + this.innerHTML.slice(1);
    appendShowEntryHeadings(this.parentNode);
  }
}

function toggleOther() {
  console.log("yo");
}
