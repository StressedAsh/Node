const path = require("path");
/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date:
 * Author: Ashutosh Dhatwalia
 *
 */

// const workerThreads = require("worker_threads");
// LARK, SEPIA, GRAYSCALE, INVERTED, DITHERING

const IOhandler = require("./IOhandler.js");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");
const pathSepia = path.join(__dirname, "sepia");
const pathInverted = path.join(__dirname, "inverted");
const userMenu = require("./IOhandler.js");
const { Worker, isMainThread, parentPort } = require("worker_threads");

const runScript = async () => {
  try {
    await IOhandler.unzip(zipFilePath, pathUnzipped);
    const pngFiles = await IOhandler.readDir(pathUnzipped);
    for (const file of pngFiles) {
      await IOhandler.grayScale(
        file,
        path.join(pathProcessed, path.basename(file))
      );
    }
    for (const file of pngFiles) {
      await IOhandler.sepia(file, path.join(pathSepia, path.basename(file)));
    }
    for (const file of pngFiles) {
      await IOhandler.invert(
        file,
        path.join(pathInverted, path.basename(file))
      );
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
};

runScript();
