import { google } from "googleapis";

type Course = {
  name: string;
  id: string;
};

type Courses = [Course];

type CourseWork = {
  title: string;
  id: string;
};

type CourseWorks = [CourseWork];

type StudentSubmission = {
  userId: string;
  id: string;
};

type StudentSubmissions = [StudentSubmission];

type Profile = {
  emailAddress: string;
};
type Student = {
  profile: Profile;
  userId: string;
};

type Students = [Student];

class ClassroomSubmit {
  course: Course;
  courseWork: CourseWork;
  studentSubmission: StudentSubmission;
  student: Student;

  getCoursesList = async (auth: any) => {
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

  getCourseWorkList = async (auth: any, courseId: any) => {
    return new Promise((resolve, reject) => {
      const classroom = google.classroom({ version: "v1", auth });
      classroom.courses.courseWork.list(
        {
          courseId: courseId,
        },
        (err: Error, res: any) => {
          if (err) reject(err);
          console.log(">>>GETTING COURSEWORKS");
          const courseWorks = res.data.courseWork;
          resolve(courseWorks);
        }
      );
    });
  };

  getStudentSubmissionsList = async (
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
          resolve(res.data.studentSubmissions);
        }
      );
    });
  };

  getStudentsList = async (auth: any, courseId: any) => {
    return new Promise((resolve, reject) => {
      const classroom = google.classroom({ version: "v1", auth });
      classroom.courses.students.list(
        {
          courseId: courseId,
        },
        (err: Error, res: any) => {
          if (err) reject(err);
          resolve(res.data.students);
        }
      );
    });
  };

  patchMark = async (conf: any, auth: any) => {
    return new Promise((resolve, reject) => {
      const classroom = google.classroom({ version: "v1", auth });
      classroom.courses.courseWork.studentSubmissions.patch(
        conf,
        (err: Error, res: any) => {
          if (err) reject(err);
          resolve(res.data.StudentSubmission)
        }
      );
    });
  };

//   createCourseWork = async (auth: any) => {
//       return new Promise((resolve, reject)=>{
//         const classroom = google.classroom({ version: "v1", auth });

//         const courseWorkFields = {
//             "title" : "lupa",
//             "description" : "Экзамен по темам массивов и матриц",
//             //@ts-ignore
//             "materials" : [],
//             'state' : 'PUBLISHED',
//             'maxPoints' : 100,
//             'workType' : 'ASSIGNMENT'
//         }
    
//         classroom.courses.courseWork.create({
//             courseId: this.course.id,
//             requestBody: courseWorkFields
//         })
//         .then(res => resolve(res))
//         .catch(err => reject(err));
//       })
//   }

  submitMark = async (
    auth: any,
    course_name: any,
    task_name: any,
    student_email: any,
    mark: any
  ) => {
    let  updateMask = {'updateMask' : 'assignedGrade'};
    await this.getCoursesList(auth).then(
      (courses: Courses) =>
        (this.course = courses.find(
          (course: Course) => course.name == course_name
        ))
    );
    // await this.createCourseWork(auth);
    await this.getCourseWorkList(auth, this.course.id).then(
      (courseWorks: CourseWorks) =>
        (this.courseWork = courseWorks.find(
          (courseWork: CourseWork) => courseWork.title == task_name
        ))
    );
    await this.getStudentsList(auth, this.course.id).then(
      (students: Students) =>
        (this.student = students.find(
          (student: Student) => student.profile.emailAddress = student_email
        ))
    );
    await this.getStudentSubmissionsList(
      auth,
      this.course.id,
      this.courseWork.id
    ).then(
      (submissions: StudentSubmissions) =>
        (this.studentSubmission = submissions.find(
          (submission: StudentSubmission) => submission.userId = this.student.userId
        ))
    );

    let conf = {
      requestBody: {
        assignedGrade: mark,
      },
      courseId: this.course.id,
      courseWorkId: this.courseWork.id,
      id: this.studentSubmission.id,
      ...updateMask,
    };

    await this.patchMark(conf, auth).then(log=>console.log(log));
  };
}

export default new ClassroomSubmit();
