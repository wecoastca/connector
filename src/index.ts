import classroomAuth from "./lib/classroomAuth";
import { start as startServer } from "./server";

const bootstrap = async () => {
  await classroomAuth.authorize(classroomAuth.credentials);
  //await initZulip();
};

const main = async () => {
  await bootstrap();
  await startServer();
};

main();
