import express, { Request, Response } from "express";
let app = express();

app.get("/submission", function (req: Request, res: Response) {
  res.json({
    course_name : req.query.course_name,
    task_name: req.query.task_name,
    student_email: req.query.student_email,
    mark: req.query.mark
  })
});

app.listen(3333, function () {
  console.log("Example app listening on port 3333!");
});

export default app;
