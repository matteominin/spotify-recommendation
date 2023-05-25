import express from "express";
import request from 'request';
import querystring from 'querystring';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';


let client_id = '15dfb3c2234c4f3e8ddf28975f5cdf7a'; // Your client id
let client_secret = 'cdfd8a548f4a4ddf83c20e8e84fbf726'; // Your secret
let redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
let stateKey = 'spotify_auth_state user-read-private user-read-email playlist-read-private playlist-read-collaborative';

const Router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let generateRandomString = function(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

Router.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

Router.get('/login', function(req, res) {

    let state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    // your application requests authorization
    let scope = 'user-top-read';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
});

Router.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter
  
    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;
  
    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };
  
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
  
          let access_token = body.access_token, refresh_token = body.refresh_token;
  
          let options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };
  
          // we can also pass the token to the browser to make requests from there
          res.send(access_token)
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  });
  
  Router.get('/refresh_token', function(req, res) {
  
    // requesting access token from refresh token
    let refresh_token = req.query.refresh_token;
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        let access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
});



export default Router;