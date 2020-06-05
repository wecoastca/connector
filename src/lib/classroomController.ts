import fs from "fs";
import readline from "readline";
import { google } from "googleapis";
import { auth } from "googleapis/build/src/apis/abusiveexperiencereport";

// If modifying these scopes, delete token.json.
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
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "src/config/token.json";
const CREDENTIALS_PATH = "src/config/credentials.json";

export const init = async () => {
  console.log(">>>INSIDE CLASSROOM API");
  // Load client secrets from a local file.
  fs.readFile(CREDENTIALS_PATH, (err, content) => {
       //fs promises api
      if (err) return console.log(err);
      console.log(">>>READ CREDENTIALS FILE");
      // Authorize a client with credentials, then call the Google Classroom API.
      authorize(JSON.parse(content.toString()));
  });
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = (credentials: any) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  console.log(">>>GET OAUTH2 TOKEN");

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      console.log(">>>CREATE NEW TOKEN");
      return getNewToken(oAuth2Client);
    }
    console.log(">>>READ TOKEN JSON");
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    console.log('>>>OAUTH2 TOKEN READY');
    //@ts-ignore
    global.oAuth2Client = oAuth2Client;
  });
  console.log('>>> READING IS FINISHED')
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client: any) {
  console.log('>>>GENERATE AUTH URL');
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
      return oAuth2Client;
    });
  });
}

export const bigboy = (
  auth: any,
  course_name: any,
  task_name: any,
  student_email: any,
  mark: any
) => {
  const classroom = google.classroom({ version: "v1", auth });
  classroom.courses.list(
    {
      pageSize: 10,
    },
    (err, res) => {
      if (err)
        return console.error(
          ">>>The API returned an error on courses list: " + err
        );
      const courses = res.data.courses;
      if (courses && courses.length) {
        console.log("Course:");
        const course = courses.find((course) => course.name == course_name);
        console.log(course);
        classroom.courses.courseWork.list(
          {
            courseId: course.id,
          },
          (err: Error, res: any) => {
            if (err)
              return console.error(
                "The API returned an error on courseWorks list: " + err
              );
            const courseWorks = res.data.courseWork;

            if (courseWorks && courseWorks.length) {
              console.log("Coursework:");
              const courseWork = courseWorks.find(
                (courseWork: any) => courseWork.title == task_name
              );
              console.log(courseWork);
              classroom.courses.courseWork.studentSubmissions.list(
                {
                  courseId: course.id,
                  courseWorkId: courseWork.id,
                },
                (err: Error, res: any) => {
                  if (err)
                    return console.error(
                      "The API returned an error on studentSubmissions list: " +
                        err
                    );
                  const studentSubmissions = res.data.studentSubmissions;

                  if (studentSubmissions && studentSubmissions.length) {
                    console.log("studentSubmissions:");
                    const studentSubmission = studentSubmissions.find(
                      (studentSubmission: any) => {
                        classroom.courses.students.list(
                          {
                            courseId: course.id,
                          },
                          (err: Error, res: any) => {
                            if (err) return err;
                            const students = res.data.students;

                            const student = students.find(
                              (student: any) =>
                                (student.profile.emailAddress = student_email)
                            );
                            console.log(student);
                            studentSubmission.userId == student.userId;
                          }
                        );
                      }
                    );
                    console.log(studentSubmission);

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
                  }
                }
              );
            }
          }
        );
        // courses.forEach((course) => {
        //   console.log(`${course.name} (${course.id})`);
        // });
      } else {
        console.log("No courses found.");
      }
    }
  );
};

const getCoursesList = (auth: any) => {
  return new Promise((resolve, reject) => {
    const classroom = google.classroom({ version: "v1", auth });
    classroom.courses.list(
      {
        pageSize: 10,
      },
      (err, res) => {
        if (err) reject(err);
        console.log(res.data.courses);
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

const submitMark = (
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
