// const fs = require("fs");
// const path = require("path");

// const filePath = path.join(__dirname, "data.json");
// // sync method

// // const data = fs.readFileSync(filePath, "utf-8");
// // console.log(data);

// // async method

// // fs.readFile(filePath, "utf-8", (err, data) => {
// //   if (err) throw err;
// //   console.log(JSON.parse(data));
// // });

// const newData = {
//   applications: [
//     { id: 1, company: "GOOGLE", role: "swe" },
//     { id: 2, company: "GOOGLE 3", role: "swe2" },
//     { id: 3, company: "GOOGLE 3", role: "swe3" },
//   ],
// };

// fs.writeFile(filePath, JSON.stringify(newData, null, 2), (err) => {
//   console.log("write complete");
// });

const http = require("http");
const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Welcome to the Job Tracker API");
  } else if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "OK" }));
  } else {
    res.writeHead(404, { "Content-type": "text/plain" });
    res.end("not found");
  }
});

server.listen(3000, () => {
  console.log("server is running on http://localhost:3000");
});
