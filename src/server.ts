import express from "express";
import path from "path";
import http from "http";
import { initGameWS } from "./socket";

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.get("*", (_, res) => {
	res.sendFile(path.join(__dirname, "public/index.html"));
});

// app.listen(PORT, () => {
// 	console.log("app on http://localhost:" + PORT);
// });

const server = http.createServer(app);

initGameWS(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, undefined, () => {
	console.log("app on http://localhost:" + PORT);
});
