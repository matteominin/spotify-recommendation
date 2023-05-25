async function getTopTracks(TOKEN) {
    let res = await fetch("https://api.spotify.com/v1/me/top/tracks", {
        method: "GET",
        headers: {
            Authorization: "Bearer " + TOKEN
        }
    })

    if(res.status == 200) 
    return await res.json();
    else
    return null;
}

export async function getRecommended(tracks, max_popularity, TOKEN) {
    let url = `https://api.spotify.com/v1/recommendations?max_popularity=${max_popularity}&limit=3&seed_tracks=`;
    tracks.forEach(elem => { url += elem + "," });
    url = url.slice(0, -1);
    
    let res = await fetch(url, {
        headers: {
            Authorization: "Bearer " + TOKEN
        }
    })
    
    if(res.status == 200) 
        return await res.json();
    else
        throw "Error, can't load recommendations. Please try again.";
}

export async function getUserId(TOKEN) {
    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: "Bearer " + TOKEN
        }
    })

    if(res.status == 200) 
        return await res.json();
    else
        throw "Error, can't find user. Please try again.";
}

export async function getPlaylistList(TOKEN) {
    const res = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
            Authorization: "Bearer " + TOKEN
        }
    })

    if(res.status == 200) 
        return await res.json();
    else
        throw "Error, can't load playlists. Please try again.";
}

export async function getPlaylistSongs(id, TOKEN) {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
        headers: {
            Authorization: "Bearer " + TOKEN
        }
    })

    if(res.status == 200) 
        return await res.json();
    else
        throw "Error, can't find playlist. Please try again.";
}