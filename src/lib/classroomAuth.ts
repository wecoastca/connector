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
const TOKEN = {
  access_token:
    "ya29.a0AfH6SMAkniMSD4lq-HpLMjmXTdBhEipARYXFCh23CHUMj8FLym-_FIK4MfP9tCzDEaSn64ip1wNQ-PfQ9gLrjx0kNssi9PiIJuEvobB6mG8qhZ6RdJTans5cHicgiMfCEA8m5YOjYTYIhuzygeWuy2IseTJjH08EvfE",
  refresh_token:
    "1//0cHY2ggZh7kMcCgYIARAAGAwSNwF-L9Irjbw3OCXJ1NkExfBa88cLp77DY-2hYBSJB240Ikdn5s3t8jqD8CSp5kJN4gUPOR8CVp8",
  scope:
    "https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.student-submissions.me.readonly https://www.googleapis.com/auth/classroom.profile.photos https://www.googleapis.com/auth/classroom.student-submissions.students.readonly https://www.googleapis.com/auth/classroom.profile.emails https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me https://www.googleapis.com/auth/classroom.coursework.students https://www.googleapis.com/auth/classroom.rosters",
  token_type: "Bearer",
  expiry_date: 1591305802488,
};
const CREDENTIALS_PATH = "src/config/credentials.json";
const CREDENTIALS = {
  installed: {
    client_id:
      "113130496267-gi3e88ivk2tbhvo3asi2assmru5k1gpc.apps.googleusercontent.com",
    project_id: "quickstart-1591046822259",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "hUHk4IvVdP0_Tu8eO63ilp6v",
    redirect_uris: ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"],
  },
};

export class classroomAuth {
  OAuth2Token: Token;
  token: any;
  credentials: any;

  constructor(googleToken: Token, credentials: Credentials) {
    this.credentials = credentials;
    this.token = googleToken;
    console.log("Class defined");
  }

  // initialAuth() {
  //   authorize(JSON.parse(this.credentials.toString())).then(
  //     (oauthToken: Token) => {
  //       this.OAuth2Token = oauthToken;
  //       console.log(this.token);
  //     }
  //   );

  // }

  authorize(credentials: any) {
    return new Promise((resolve, reject) => {
      console.log(">>>INSIDE CLASSROOM API");
      console.log(">>>READ CREDENTIALS FILE");
      
      const oAuth2Client = new google.auth.OAuth2(
        this.credentials.installed.client_id,
        this.credentials.installed.client_secret,
        this.credentials.installed.redirect_uris[0]
      );

      console.log(">>>GET OAUTH2 TOKEN");

      console.log(">>>READ TOKEN JSON");
      oAuth2Client.setCredentials(this.token);
      console.log(">>>OAUTH2 TOKEN READY");
      this.OAuth2Token = oAuth2Client;
      resolve(oAuth2Client);
    });
  }

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

export default new classroomAuth(TOKEN, CREDENTIALS);
