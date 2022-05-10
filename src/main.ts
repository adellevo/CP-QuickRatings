import { scheduleBuilder } from "./scheduleBuilder";
import { studentCenter } from "./studentCenter";

const main = async () => {
  while (true) {
    studentCenter();
    scheduleBuilder();
    // Sleep for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

main();
