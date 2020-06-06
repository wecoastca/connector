import express, { Request, Response } from "express";
import { bigboy, submitMark } from "./lib/classroomController";
import classroomAuth from "./lib/classroomAuth";
import classroomSubmit from './lib/classroomSubmit';

const app = express();

export const start = () => {
  app.listen(3333, function () {
    console.log("Example app listening on port 3333!");
  });
};

app.get("/submission", function (req: Request, res: Response) {
  res.json({
    course_name: req.query.course_name,
    task_name: req.query.task_name,
    student_email: req.query.student_email,
    mark: req.query.mark,
  });
  classroomSubmit.submitMark(
    classroomAuth.OAuth2Token,
    req.query.course_name,
    req.query.task_name,
    req.query.student_email,
    req.query.mark
  );
});
