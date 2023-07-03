import config from "./config";
import { boltApp } from "./bolt";
import { expressApp } from "./express";

(async () => {
  expressApp.listen(config.EXPRESS_PORT, () =>
    console.log("[server] Express is running")
  );
  boltApp
    .start(config.SLACK_PORT)
    .then(() => console.log("[server] Bolt is running"));
})();
