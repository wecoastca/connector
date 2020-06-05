import { init as initClassroom } from "./lib/classroomController";
import { start as startServer } from "./server";

const bootstrap = async () => {
  initClassroom();
  //await initZulip();
};

const main = async () => {
  await bootstrap();
  //@ts-ignore
  startServer(global.oAuth2Client);
};

main();
