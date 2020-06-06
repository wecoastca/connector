import fs from "fs";
import { google } from "googleapis";
import readline from "readline";

const SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.students",
  "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me",
  "https://www.googleapis.com/auth/classroom.rosters",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
  "https://www.googleapis.com/auth/classroom.profile.photos",
];
const TOKEN_PATH = "src/config/token.json";
const CREDENTIALS_PATH = "src/config/credentials.json";

export class classroomAuth {
  protected static _instance: classroomAuth = new classroomAuth();
  token: Token;

  constructor() {
    if (classroomAuth._instance) {
      throw new Error(
        "Instantiation failed: " + "use classroomAuth.getInstance() instead of new."
      );
    }

    console.log(">>>INSIDE CLASSROOM API");
    fs.readFile(CREDENTIALS_PATH, (err, content) => {
      //fs promises api
      if (err) return console.log(err);
      console.log(">>>READ CREDENTIALS FILE");
      // Authorize a client with credentials, then call the Google Classroom API.
      this.authorize(JSON.parse(content.toString())).then((oauthToken) => {
        //@ts-ignore
        this.token = oauthToken;
        console.log(this.token);
      });
      console.log('Class defined')
    });
    console.log('Class constructed')
  }

  public static getInstance() :classroomAuth {
    return classroomAuth._instance;
  }

  authorize = (credentials: any) => {
    return new Promise((resolve, reject) => {
      const { client_secret, client_id, redirect_uris } = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      console.log(">>>GET OAUTH2 TOKEN");

      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          console.log(">>>CREATE NEW TOKEN");
          this.getNewToken(oAuth2Client);
        }
        console.log(">>>READ TOKEN JSON");
        oAuth2Client.setCredentials(JSON.parse(token.toString()));
        console.log(">>>OAUTH2 TOKEN READY");

        resolve(oAuth2Client);
      });
    });
  };

  getNewToken = (oAuth2Client: any) => {
    console.log(">>>GENERATE AUTH URL");
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err: any, token: any) => {
        if (err) return console.log(err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.log(err);
          console.log("Token stored to", TOKEN_PATH);
        });
        this.token = oAuth2Client;
      });
    });
  };
}

export default classroomAuth;
