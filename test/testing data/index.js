const readline = require("readline");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs");
var folders = "dirListing.txt";
var files = "fileListing.txt";

const allFileContents = fs.readFileSync(files, "utf-8");
const linesFile = allFileContents.split(/\r?\n/); //.forEach((line) => processLine(line));

const allFolderContents = fs.readFileSync(folders, "utf-8");
const linesFolder = allFolderContents.split(/\r?\n/); //.forEach((line) => processLine(line));

function processAllFileLines() {
  processFileLine(linesFile.shift()).then(() => processAllFileLines());
}

function processAllFolderLines() {
  processFolderLine(linesFolder.shift()).then(() => processAllFolderLines());
}

async function processFolderLine(line) {
  const fullName = line.slice(2);
  const name = fullName.split("/").slice(-1)[0];
  const parent = fullName.split("/").length > 1 && fullName.split("/").slice(0, -1).join("/");
  console.log(fullName, parent); // print the content of the line on each linebreak

  const parentId = parent && folderIds[parent];

  const url = "http://localhost:3000/v1/folders";
  const body = { name, parentId };
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  if (res.status != 201) {
    console.log("Failed to POST", body);
    process.exit();
  }
  const data = await res.json(); //assuming data is json
  folderIds[fullName] = data.id;

  // process.exit();
}

async function processFileLine(line) {
  const fullName = line.slice(2);
  const filename = fullName.split("/").slice(-1)[0];
  const parent = fullName.split("/").length > 1 && fullName.split("/").slice(0, -1).join("/");
  console.log(fullName, parent); // print the content of the line on each linebreak

  const parentId = parent && folderIds["/" + parent];

  const url = "http://localhost:3000/v1/files";
  const body = { name: filename, parentId };
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  if (res.status != 201) {
    console.log("Failed to POST", body);
    process.exit();
  }
  // process.exit();
}

let folderIds = {};
// processAllFolderLines();
fetch("http://localhost:3000/v1/folders", {
  method: "GET",
  headers: { "Content-Type": "application/json" },
}).then(async (res) => {
  let body = await res.json();
  body.forEach((f) => {
    folderIds[f.path] = f.id;
  });
  processAllFileLines();
});
