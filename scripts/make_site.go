package main

import (
	"encoding/json"
	"html/template"
	"io/ioutil"
	"fmt"
	"log"
	"os"
)


type Show struct {
	Number uint
	Title string
	Date string
	Stream string
	Skip_talking bool
	Tracklist []struct {
		Start_minutes uint
		Start_seconds uint
		End_minutes uint
		End_seconds uint
		Artist string
		Title string
	}
}


func main() {
	// Make show entry pages
	showJson, err := ioutil.ReadFile("show_entries.json")
	if err != nil { log.Fatal("Failed to read show_entries.json: ", err) }
	var shows []Show
	err = json.Unmarshal(showJson, &shows)
	if err != nil { log.Fatal("Failed to parse show_entries.json: ", err) }
	urlsJson, err := ioutil.ReadFile("artist_track_urls.json")
	if err != nil { log.Fatal("Failed to read artist_track_urls.json: ", err) }
	var urls map[string]struct { Tracks map[string]string; Url string }
	err = json.Unmarshal(urlsJson, &urls)
	if err != nil { log.Fatal("Failed to parse artist_track_urls.json: ", err) }
	showTemplate, err := template.ParseFiles("show_template.html")
	if err != nil { log.Fatal("Failed to parse show_template.html: ", err) }
	for i, show := range shows {
		err = os.MkdirAll(fmt.Sprintf("www/%v", show.Number), 0755)
		if err != nil { log.Fatal("Failed to make show www directory: ", err) }
		htmlOutFile, err := os.Create(fmt.Sprintf("www/%v/index.html", show.Number))
		defer htmlOutFile.Close()
		if err != nil { log.Fatal("Failed to open file for writing: ", err) }
		err = showTemplate.Execute(htmlOutFile, struct {
			Shows []Show
			Urls map[string]struct { Tracks map[string]string; Url string }
			I uint
		}{ shows, urls, uint(i), })
		if err != nil { log.Fatal("Failed to use show template: ", err) }
		var starts, ends []uint
		for _, track := range show.Tracklist {
			start := track.Start_minutes*60 + track.Start_seconds
			end := track.End_minutes*60 + track.End_seconds
			starts = append(starts, start)
			ends = append(ends, end)
		}
		startsEndsJson, err := json.Marshal(struct {
			Starts []uint `json:"starts"`
			Ends []uint `json:"ends"`
		} { starts, ends, })
		if err != nil { log.Fatal("Failed to create starts-ends json: ", err) }
		err = ioutil.WriteFile(fmt.Sprintf("www/%v/starts_ends.json", show.Number), startsEndsJson, 0644)
		if err != nil { log.Fatal("Failed to write out to json file: ", err) }
	}

	// Make main page
	indexTemplate, err := template.ParseFiles("index_template.html")
	if err != nil { log.Fatal("Failed to parse index_template.html: ", err) }
	indexOutFile, err := os.Create("www/index.html")
	defer indexOutFile.Close()
	if err != nil { log.Fatal("Failed to open file for writing: ", err) }
	artistToPlays := make(map[string]uint)
	for _, show := range shows {
		for _, track := range show.Tracklist {
			artistToPlays[track.Artist] += 1
		}
	}
	topArtists := make([]struct{ Artist string; Plays uint }, 10)
	for artist, plays := range artistToPlays {
		for i := range topArtists {
			if (plays > topArtists[i].Plays) {
				for j := len(topArtists)-2; j >= i ; j-- {
					topArtists[j+1] = topArtists[j]
				}
				topArtists[i] = struct{ Artist string; Plays uint }{ artist, plays, }
				break
			}
		}
	}
	err = indexTemplate.Execute(indexOutFile, struct {
		Shows []Show
		Urls map[string]struct { Tracks map[string]string; Url string }
		TopArtists []struct{ Artist string; Plays uint }
	}{ shows, urls, topArtists, })
	if err != nil { log.Fatal("Failed to use index template: ", err) }
}
