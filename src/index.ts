import config from "./config";
import { boltApp } from "./bolt";

(async () => {
  // Start the Slack Bot Bolt server
  boltApp
    .start(config.SLACK_PORT)
    .then(() => console.log("[server] Bolt is running"));
})();
