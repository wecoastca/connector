import { init as initClassroom } from "./lib/classroomController";
import { start as startServer } from "./server";

const bootstrap = async () => {
  const authClassroom = await initClassroom();
  //await initZulip();
  return { authClassroom: authClassroom };
};

const main = async () => {
  const auth = await bootstrap();
  startServer(auth.authClassroom);
};

main();
