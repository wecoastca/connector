import express, { Request, Response } from 'express';
let expressApp = express();

expressApp.get('/', function (req:Request, res:Response) {
  res.send('Hello World!');
});

expressApp.listen(8000, function () {
  console.log('Example app listening on port 3000!');
});

export default expressApp;