var SpotifyWebApi = require('spotify-web-api-node');
var bodyParser = require('body-parser');
var nsHttp = require("http");
var fs = require('fs');
const express = require('express');
const querystring = require('querystring');
const axios = require('axios');
const app = express();
const port = 3000;
var jsonParser = bodyParser.json()
var access = ''
var redirectUri = "http://localhost:3000/callback";
var htmlToSend = "";
var favSongScore = 0;
var containsPlaylist = false;
var favSongName = "Don't Let Me Down"
var discoverWeeklySongs = [];
let songsToAdd = [];
var spotifyApi = new SpotifyWebApi({
  clientId : "",
  clientSecret : "",
  redirectUri : redirectUri
});
app.use(jsonParser)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname));
spotifyApi.setAccessToken(access);
app.get('/', (req, res) => {
  fs.readFile('index.html', function(err, data){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  })
});

app.get('/search', (req, res) => {
  var songs = [];
  spotifyApi.searchTracks(req.query.songPartial, {limit: 8}).then(function (data){
    data.body.tracks.items.forEach(function(song){
      if (song.name){
        songs.push({
          'name': song.name,
          'artist': song.artists,
          'art': song.album.images
        });
      }
      
    });
    res.send(songs);
  });
});

app.get('/scores', (req, res) => {
  spotifyApi.setAccessToken(access);
  var discoverWeekly = '37i9dQZEVXcG13dB1xxByR';
  var favSongFeatures;


  spotifyApi.getAudioFeaturesForTrack('1i1fxkWeaMmKEB4T7zqbzK').then(
    function(data){
      favSongFeatures = {danceability: data.body.danceability,
        energy:data.body.energy,
        loudness: data.body.loudness,
        speechiness:data.body.speechiness,
        acousticness:data.body.acousticness,
        instrumentalness:data.body.instrumentalness,
        liveness:data.body.liveness,
        valence:data.body.valence}
    }
  );

  spotifyApi.getPlaylist(discoverWeekly).then(
    function(songData){
      var songIDs = []
      for (var i = 0; i < 30; i++){
        songIDs.push(songData.body.tracks.items[i].track.id);
      }
      
      for (const [key, value] of Object.entries(favSongFeatures)){
        favSongScore += value + 100;
      }
      htmlToSend = "";
      htmlToSend += "<h1>Don't Let Me Down Score: " + favSongScore + "</h1><br>";
      
      spotifyApi.getAudioFeaturesForTracks(songIDs).then(
        function(dd){
          dd.body.audio_features.forEach(function(song){
            var songScore = 0;
            songScore += song["danceability"] + 100;
            songScore += song["energy"] + 100;
            songScore += song["loudness"] + 100;
            songScore += song["speechiness"] + 100;
            songScore += song["acousticness"] + 100;
            songScore += song["instrumentalness"] + 100;
            songScore += song["liveness"] + 100;
            songScore += song["valence"] + 100;
            axios.get('https://api.spotify.com/v1/tracks/' + song["id"], {headers: {"Authorization": "Bearer " + access}}).then(function(res){
              discoverWeeklySongs.push({'id':res.data.id.toString().trim(), 'name':res.data.name, 'score':songScore});
            });
          });
        }
      );
    }
  );
  discoverWeeklySongs.sort(function(a, b){
    return (Math.abs(favSongScore-a.score) - Math.abs(favSongScore-b.score));
  });
  var currentSong;
  
  for (var i = 0; i < discoverWeeklySongs.length; i++){
    currentSong = discoverWeeklySongs[i].name;
    htmlToSend += "<br><h2>" + discoverWeeklySongs[i].name + " Score : " + discoverWeeklySongs[i].score;
    songsToAdd[i] = "spotify:track:"+discoverWeeklySongs[i].id;
    console.log(songsToAdd);
  }
  
  //create playlist with song name and add songs
  var playlistID = "";
  if (discoverWeeklySongs.length > 0){
    spotifyApi.createPlaylist("DWS - " + favSongName).then(function (data)
    {
      spotifyApi.addTracksToPlaylist(data.body.id, songsToAdd)
      .then(function(data) {
        console.log('Added tracks to playlist!');
      }, function(err) {
        console.log('Something went wrong!', err);
      });
    }
    );
  }
  res.send(htmlToSend);
});

app.get('/callback', function (req, res){
  res.send(req.params);
});
app.get('/login', function(req, res) {
  var scope = 'user-read-private user-read-email playlist-modify-private playlist-read-private user-library-modify user-library-read playlist-modify-public';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'token',
      client_id : "",
      scope: scope,
      redirect_uri: redirectUri
    }));
});

async function getSongName(id){
  spotifyApi.search(id).then(data =>{
    return data.body.tracks?.items[0].name;
  });
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})