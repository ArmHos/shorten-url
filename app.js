import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3001;
app.use(express.static(path.resolve("public")));
app.use(express.json());

const urlDataPath = path.resolve("urlData.json");

app.get("/data", async (req, res) => {
  const urlData = await readFiles(urlDataPath);
  res.json(JSON.stringify(urlData));
});

app.post("/data", (req, res) => {
  let expression =
    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  let { url } = req.body;
  if (url.match(expression)) {
    const newUrl = {
      id: generateID(),
      url,
    };
    newUrl.updatedURL = `http://localhost:${PORT}/${newUrl.id}`;
    newUrl.faviconLinkPNG = faviconLink(url);
    newUrl.QR = generateQR(url);
    let { updatedURL, faviconLinkPNG, QR } = newUrl;
    addingLinks(newUrl);
    res.send({
      message: "The URL Match the requirements",
      updatedURL,
      faviconLinkPNG,
      QR,
    });
  } else {
    res.send({
      message: "The URL don't match the requirements.",
    });
  }
});

app.get(`/:id`, (req, res) => {
  redirectToOriginalLink(req, res);
});

async function readFiles(path) {
  try {
    const data = await fs.promises.readFile(path, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    throw new Error(err);
  }
}

function faviconLink(link) {
  let indexes = [];
  link.split("").forEach((str, i) => {
    if (str === "/") {
      indexes.push(i);
    }
  });
  return `${link.slice(0, indexes[2])}/favicon.ico`;
}

async function writeData(path, data) {
  try {
    await fs.promises.writeFile(path, data, "utf-8");
  } catch (err) {
    throw new Error(err);
  }
}

function generateID() {
  let id = "";
  let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 4; i++) {
    id += alphabet[Math.floor(Math.random() * 52)];
  }
  return id;
}

function generateQR(link) {
  try {
    const QR = `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${link}`;
    return QR;
  } catch (err) {
    throw new Error(err);
  }
}

async function redirectToOriginalLink(req, res) {
  const data = await readFiles(urlDataPath);
  let filteredURL = data.filter((item) => item.id === req.params.id);
  if (filteredURL.length !== 0) {
    console.log(filteredURL);
    res.redirect(filteredURL[0].url);
  } else {
    res.send("Not Found");
  }
}

async function addingLinks(newUrl) {
  const data = await readFiles(urlDataPath);
  data.push(newUrl);
  await writeData(urlDataPath, JSON.stringify(data));
}

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
