import json


def main():
  with open('www/show_entries.json') as f:
    show_entries = json.load(f)
  with open('www/artist_track_urls.json') as f:
    d = json.load(f)
  for show_entry in show_entries:
    tracklist = show_entry['tracklist']
    for track in tracklist:
      artist = track['artist']
      title = track['title']
      if artist in d:
        if title not in d[artist]['tracks']:
          d[artist]['tracks'][title] = ""
      else:
        d[artist] = {
          'tracks': {
            title: ""
          },
          'url': ""
        }
  with open('www/artist_track_urls.json', 'w') as f:
    json.dump(d, f, sort_keys=True, indent=2, ensure_ascii=False)

if __name__ == '__main__':
  main()
