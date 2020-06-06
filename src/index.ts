import classroomAuth from "./lib/classroomAuth";
import { start as startServer, start } from "./server";
import { waitingForRequest } from "./server";

const bootstrap = async () => {
  const classroomAuthInstance = classroomAuth.getInstance();
  return classroomAuthInstance;
  //await initZulip();
};

const main = () => {
  startServer();
  bootstrap().then((auth) => waitingForRequest(auth.token));
};

main();
