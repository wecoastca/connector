import express, { Request, Response } from "express";
let app = express();

import { submitMark } from "./lib/classroomController";

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
  submitMark(
    req.query.course_name,
    req.query.task_name,
    req.query.student_email,
    req.query.mark
  );
});
