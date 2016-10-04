# http://andrew.cmu.edu/~mmendell/ha/
1. Update `show_entries.json`, `index_template.html`, and `show_template.html` to be relevant for your show.
1. Run `$ python3 scripts/update_artist_track_urls.py`, then update `""` entries in `artist_track_urls.json`.
1. Run `$ go run scripts/make_website.go` to generate the site in `www`.
1. Serve the site statically from `www` (e.g. `$ (cd www && python3 -m http.server 4444)`, then visit <http://localhost:4444/> in your browser).
