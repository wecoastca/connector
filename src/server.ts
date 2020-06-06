import express, { Request, Response } from "express";
import { bigboy } from "./lib/classroomController";
import classroomAuth from "./lib/classroomAuth";

const app = express();

export const start = () => {
  app.listen(3333, function () {
    console.log("Example app listening on port 3333!");
  });
};

export const waitingForRequest = (auth: any) => {
  app.get("/submission", function (req: Request, res: Response) {
    res.json({
      course_name: req.query.course_name,
      task_name: req.query.task_name,
      student_email: req.query.student_email,
      mark: req.query.mark,
    });
    bigboy(
      auth,
      req.query.course_name,
      req.query.task_name,
      req.query.student_email,
      req.query.mark
    );
  });
};
