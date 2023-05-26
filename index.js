import loginRoutes from './auth.js'
import express from 'express';
import { getPlaylistList, getPlaylistSongs, getRecommended } from './apiFunctions.js';
import { apiKey, goBack, openBrowserPrompt, playlistPrompt, popularityPrompt, songPrompt } from './prompt.js';

//remove fetch warning
process.removeAllListeners('warning')
console.clear()

const app = express();
app.use(loginRoutes)
const server = app.listen(8888);

(async () => {
    //Get token and close express server
    let TOKEN = await apiKey();
    server.close()

    //Get playlists list
    let playlists = [];
    try {
        playlists = await getPlaylistList(TOKEN)
        playlists = playlists.items.map(elem => [elem.name, elem.id]);
        
        console.clear()
    } catch (err) {
        console.log(err); 
        process.exit(1)
    }
    
    //Get songs from selected playlist
    let selectedPlaylist = "";
    let songs = [];
    let selectedSongs = [];
    let back = true;

    do{
        try{
            selectedPlaylist = await playlistPrompt(playlists);

            let res = await getPlaylistSongs(playlists.find(elem => elem[0] == selectedPlaylist)[1], TOKEN)
            songs = res.tracks.items.map(elem => [elem.track.name, elem.track.id])
     
            const tmp = await songPrompt(songs, selectedSongs)
            selectedSongs.push(...tmp)
        }catch(err){
            console.log(err); 
            process.exit(1)
        }

        if(selectedSongs.length < 5)
            back = await goBack();
        else
            back = false;
    }while(back)

    //set additional parameters
    const popularity = await popularityPrompt();


    //Get recommended songs
    let recommended = [];
    try {
        console.log("\nYour recommended songs are:\n")
        recommended = await getRecommended(selectedSongs, popularity, TOKEN)
        recommended.tracks.map(elem => console.log(elem.name + ": https://open.spotify.com/track/" + elem.id));
        console.log("\n")
    } catch (error) {
        console.log(error)
        process.exit(1)
    }

    //Open browser
    openBrowserPrompt(recommended)
})()