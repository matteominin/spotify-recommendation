const inquirer = require('inquirer');
const browser = require('openurl')
const { getToken } = require('./auth.js');

async function apiKey(){
    let tok;
    let res = await inquirer.prompt([
        {
            type: "input",
            name: "ApiKey",
            message: "Click on the link and log into your Spotify account \n\n http://localhost:8888/login then press enter (or enter your API Key)",
            validate: (input) => { 
                tok = getToken();
                if(input.length == 0 && tok.length != 0){
                    return true;
                }else if (input.length == 0 && tok.length == 0){
                    return "Please enter your API Key"; 
                }else{
                    return true;
                }
            }
        }
    ])

    //fetch token from prompt or server
    if(res.ApiKey.length != 0)
        res = res.ApiKey;
    else
        res = tok;

    return res;
}

async function playlistPrompt(playlists){
    const res = await inquirer.prompt([
        {
            type: "list",
            name: "playlist",
            message: "Select a playlist:",
            choices: playlists.map(elem => elem[0])
        }
    ])

    return res.playlist;
}

async function songPrompt(songs, selectedSongs){
    const maxSongs = 5 - selectedSongs.length;

    let res = await inquirer.prompt([{
        type: "checkbox",
        name: "songs",
        message: `Select up to ${maxSongs} songs:`,
        loop: false,
        choices: songs.map(elem => elem[0]),
        validate: (input) => {
            let inputSongsId = input.map(song => {
                return songs.find(elem => elem[0] == song)[1];
            });
            
            let repeted = findRepeted(inputSongsId, selectedSongs);

            
            if(input.length > maxSongs)     //check if exceeds max songs
                return `You can only select up to ${maxSongs} songs.`;
            else if(repeted.length > 0){    //check if there are repeted songs
                let repetedSongsName = repeted.map(elem => `"${songs.find(song => song[1] == elem)[0]}"`).join(", ");
                return `You have already selected ${repetedSongsName}, remove it.`;
            }
            else
                return true;
        }
    }])

    let tracks = res.songs.map(elem => songs.find(song => song[0] == elem)[1])

    return tracks;
}

function findRepeted(a, b) {
    let repeted = []
    a.forEach(elem => {
      b.forEach(item => {
        if(elem == item)
          repeted.push(elem)
      })
    })
    return repeted;
}

async function goBack() {
    let back = await inquirer.prompt([{
        type: "confirm",
        name: "back",
        message: "Would you like to select from another playlist?",
        default: false
    }])

    return back.back;
}

async function popularityPrompt() {
    const res = await inquirer.prompt([{
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
    }])

    return res.popularity;
}

async function openBrowserPrompt(tracks) {
    await inquirer.prompt([{
        type: "confirm",
        name: "open",
        message: "Do you want to open the songs in your browser?"
    }]).then(answer => {
        if(answer.open) 
            tracks.tracks.forEach(async elem => await browser.open("https://open.spotify.com/track/" + elem.id))
    })
}

module.exports = { apiKey, goBack, openBrowserPrompt, playlistPrompt, popularityPrompt, songPrompt }