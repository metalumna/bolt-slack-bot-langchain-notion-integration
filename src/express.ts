import express from "express";

export const expressApp = express();

expressApp.get("/", (req, res) => {
  res.send("Express + TypeScript Server");
});

expressApp.get("/auth/slack", (req, res) => {
  res.send("Slack authentication");
});
