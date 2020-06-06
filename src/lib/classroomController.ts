import { google } from "googleapis";

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
