import { init as initClassroom } from "./lib/classroomController";
import { start as startServer } from "./server";

const bootstrap = async () => {
  await initClassroom();
  //await initZulip();
};

const main = async () => {
  await bootstrap();
  startServer();
};

main();
