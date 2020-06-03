import axios from "axios";

export const fetchMark = () => {
  const data = axios
    .get("http://51.15.104.77:3333/submission")
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error(error);
    });
};

