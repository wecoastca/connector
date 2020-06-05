import express, { Request, Response } from "express";
import { bigboy } from "./lib/classroomController";

const app = express();

export const start = (auth: any) => {
  app.listen(3333, function () {
    console.log("Example app listening on port 3333!");
  });

  app.get("/submission", function (req: Request, res: Response) {
    res.json({
      course_name: req.query.course_name,
      task_name: req.query.task_name,
      student_email: req.query.student_email,
      mark: req.query.mark,
    });
    bigboy(
      req.query.course_name,
      req.query.task_name,
      req.query.student_email,
      req.query.mark,
      //@ts-ignore
      global.oAuth2Client
    );
  });
};
