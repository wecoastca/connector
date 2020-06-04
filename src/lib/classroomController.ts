import fs from "fs";
import readline from "readline";
import { google, GoogleApis } from "googleapis";
import { analytics } from "googleapis/build/src/apis/analytics";
import { rejects } from "assert";
import { auth } from "googleapis/build/src/apis/abusiveexperiencereport";
import { resolve } from "dns";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/classroom.courses.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "src/config/token.json";
const CREDENTIALS_PATH = "src/config/credentials.json";

export const init = async () => {
  //TODO: асинхронный вызов
  getEntryPointToClassroom()
    .then()
    .then((auth) => {
      return auth;
    });
};

const getEntryPointToClassroom = () => {
  return new Promise((resolve, reject) => {
    // Load client secrets from a local file.
    fs.readFile(CREDENTIALS_PATH, (err, content) => {
      //fs promises api
      if (err) reject(err);
      // Authorize a client with credentials, then call the Google Classroom API.
      resolve(authorize(JSON.parse(content.toString())));
    });
  });
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials: any) {
  return new Promise((resolve, reject) => {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) reject(getNewToken(oAuth2Client));
      oAuth2Client.setCredentials(JSON.parse(token.toString()));
      resolve(oAuth2Client);
    });
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client: any) {
  return new Promise((resolve, reject) => {
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
        if (err) reject(err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) reject(err);
          console.log("Token stored to", TOKEN_PATH);
        });
        resolve(oAuth2Client);
      });
    });
  });
}
const getCoursesList = (auth: any) => {
  return new Promise((resolve, reject) => {
    const classroom = google.classroom({ version: "v1", auth });
    classroom.courses.list(
      {
        pageSize: 10,
      },
      (err, res) => {
        if (err) reject(err);
        resolve(res.data.courses);
      }
    );
  });
};

const getCourseWorkList = (auth: any, courseId: any) => {
  return new Promise((resolve, reject) => {
    const classroom = google.classroom({ version: "v1", auth });
    classroom.courses.courseWork.list(
      {
        courseId: courseId,
      },
      (err: Error, res: any) => {
        if (err) reject(err);
        resolve(res.data.courses.courseWork);
      }
    );
  });
};

const getStudentSubmissionsList = (
  auth: any,
  courseId: any,
  courseWorkId: any
) => {
  return new Promise((resolve, reject) => {
    const classroom = google.classroom({ version: "v1", auth });
    classroom.courses.courseWork.studentSubmissions.list(
      {
        courseId: courseId,
        courseWorkId: courseWorkId,
      },
      (err: Error, res: any) => {
        if (err) reject(err);
        resolve(res.data.courses.courseWork.studentSubmissions);
      }
    );
  });
};

const getStudentsList = (auth: any, courseId: any) => {
  return new Promise((resolve, reject) => {
    const classroom = google.classroom({ version: "v1", auth });
    classroom.courses.students.list(
      {
        courseId: courseId,
      },
      (err: Error, res: any) => {
        if (err) reject(err);
        resolve(res.data.courses.students);
      }
    );
  });
};

export const submitMark = (
  course_name: any,
  task_name: any,
  student_email: any,
  mark: any,
  auth: any
) => {
  //@ts-ignore
  getCoursesList(auth).then((courses) => {
    //@ts-ignore
    const course = courses.find((course) => course.name == course_name);
    getCourseWorkList(auth, course.id).then((courseWorks) => {
      //@ts-ignore
      const courseWork = courseWorks.find((courseWork) => {
        courseWork.title == task_name;
      });
      getStudentSubmissionsList(auth, course.id, courseWork.id).then(
        (submissions) => {
          getStudentsList(auth, course.id).then((students) => {
            //@ts-ignore
            const student = students.find((student) => {
              student.profile.emailAddress = student_email;
            });
            //@ts-ignore
            const studentSubmission = submissions.find((submission) => {
              submission.userId = student.userId;

              let conf = {
                requestBody: {
                  assignedGrade: mark,
                },
                courseId: course.id,
                courseWorkId: courseWork.id,
                id: studentSubmission.id,
                //@ts-ignore
                ...updateMask,
              };

              studentSubmission.patch(conf);
            });
          });
        }
      );
    });
  });
};
