import inquirer from 'inquirer';
import loginRoutes from './auth.js'
import express from 'express';
import open from 'open';
import { getPlaylistList, getPlaylistSongs, getRecommended} from './apiFunctions.js';

//remove fetch warning
process.removeAllListeners('warning')

const app = express();
app.use(loginRoutes)
const server = app.listen(8888);

open("http://localhost:8888/login")
inquirer.prompt([{
    type: "input",
    name: "ApiKey",
    message: "Click on the link and log into your Spotify account \n\n http://localhost:8888/login and paste here your API Key:"
}]).then(async answer => {
    const TOKEN = answer.ApiKey;
    server.close()

    let playlists = await getPlaylistList(TOKEN).catch(err => console.log(err))
    playlists = playlists.items.map(elem => [elem.name, elem.id]);
    
    inquirer.prompt([{
        type: "list",
        name: "playlist",
        message: "Select a playlist:",
        choices: playlists.map(elem => elem[0]),
    }]).then(async (answer) => {
        let res = await getPlaylistSongs(playlists.find(elem => elem[0] == answer.playlist)[1], TOKEN).catch(err => console.log(err))
        let songs = res.tracks.items.map(elem => [elem.track.name, elem.track.id])

        let n = 0;
        inquirer.prompt([{
            type: "checkbox",
            name: "songs",
            message: "Select songs up to 5 songs:",
            loop: false,
            choices: songs.map(elem => elem[0])
        }]).then(async (answer) => {
            let tracks = answer.songs.map(elem => songs.find(song => song[0] == elem)[1])

            if(tracks.length > 5) {
                console.log("\nYou can only select up to 5 songs.\n")
                return;
            }else if(tracks.length == 0) { 
                console.log("\nYou must select at least 1 song.\n")
                return;
            }

            inquirer.prompt([{
                type: "number",
                name: "popularity",
                message: "Select the maximum popularity of the songs (0-100):",
                default: 100,
                validate: (input) => {
                    if(input < 0 || input > 100) 
                        return "Please enter a number between 0 and 100";
                    else 
                        return true;
                }
            }]).then(async (answer) => {
                let max_popularity = answer.popularity;

                console.log("\nYour recommended songs are:\n")
                let res = await getRecommended(tracks, max_popularity, TOKEN).catch(err => console.log(err))
                res.tracks.map(elem => console.log(elem.name + ": https://open.spotify.com/track/" + elem.id));
                console.log("\n")

                inquirer.prompt([{
                    type: "confirm",
                    name: "open",
                    message: "Do you want to open the songs in your browser?"
                }]).then(answer => {
                    if(answer.open) 
                        res.tracks.forEach(async elem => await open("https://open.spotify.com/track/" + elem.id))
                })
            })
        })
    })
})