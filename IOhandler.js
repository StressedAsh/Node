/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date: 12-02-2024
 * Author: Ashutosh Dhatwalia
 *-
 */

const unzipper = require("unzipper");
const fs = require("fs");
const PNG = require("pngjs").PNG;
const { pipeline } = require("stream");

const stream = require("stream");
const { Transform } = require("stream");
const { error } = require("console");
const { type } = require("os");
const { existsSync, mkdirSync } = require("fs");
const path = require("path");
const { readFile } = require("fs/promises");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */

const unzip = async (pathIn, pathOut) => {
  let fileIndex = 1;
  return new Promise((resolve, reject) => {
    fs.createReadStream(pathIn)
      .pipe(unzipper.Parse())
      .on("entry", (entry) => {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'
        if (type == "File" && !fileName.includes("MACOS")) {
          const outputFile = `image${fileIndex}.png`;
          fileIndex++;
          fs.promises
            .mkdir(pathOut, { recursive: true })
            .then(() => {
              entry.pipe(fs.createWriteStream(path.join(pathOut, outputFile)));
            })
            .catch((error) => {
              console.error("Error while creating directory:", error);
              reject(error);
            });
        } else {
          entry.autodrain();
        }
      })
      .on("error", (error) => {
        console.error("Error while unzipping:", error);
        reject(error);
      })
      .on("close", () => {
        console.log("Extraction complete");
        resolve();
      });
  });
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */

const readDir = async (dir) => {
  try {
    const files = await fs.promises.readdir(path.resolve(__dirname, dir));
    const filteredFiles = files.filter((file) => file.endsWith(".png"));
    const filePaths = filteredFiles.map((file) =>
      path.resolve(__dirname, dir, file)
    );
    return filePaths;
  } catch (error) {
    console.error("Error while reading directory:", error);
    reject(error);
  }
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */

const grayScale = async (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    fs.promises
      .mkdir(path.dirname(pathOut), { recursive: true })
      .catch((error) => {
        console.error("Error while creating directory:", error);
        reject(error);
      });
    fs.createReadStream(pathIn)
      .pipe(new PNG())
      .on("parsed", function () {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            const avg = Math.round(
              (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3
            );
            this.data[idx] = avg;
            this.data[idx + 1] = avg;
            this.data[idx + 2] = avg;
          }
        }

        this.pack()
          .pipe(fs.createWriteStream(pathOut))
          .on("finish", () => {
            console.log(`Grayscale conversion completed for ${pathIn}`);
            resolve();
          })
          .on("error", (error) => {
            console.error(
              `Error writing grayscale image for ${pathIn}: ${error}`
            );
            reject(error);
          });
      })
      .on("error", (error) => {
        console.error(`Error parsing PNG file ${pathIn}: ${error}`);
        reject(error);
      });
  });
};

const sepia = async (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    fs.promises
      .mkdir(path.dirname(pathOut), { recursive: true })
      .catch((error) => {
        console.error("Error while creating directory:", error);
        reject(error);
      });
    fs.createReadStream(pathIn)
      .pipe(new PNG())
      .on("parsed", function () {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            let r = this.data[idx];
            let g = this.data[idx + 1];
            let b = this.data[idx + 2];
            this.data[idx] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
            this.data[idx + 1] = Math.min(
              255,
              r * 0.349 + g * 0.686 + b * 0.168
            );
            this.data[idx + 2] = Math.min(
              255,
              r * 0.272 + g * 0.534 + b * 0.131
            );
          }
        }

        this.pack()
          .pipe(fs.createWriteStream(pathOut))
          .on("finish", () => {
            console.log(`Sepia conversion completed for ${pathIn}`);
            resolve();
          })
          .on("error", (error) => {
            console.error(`Error writing sepia image for ${pathIn}: ${error}`);
            reject(error);
          });
      })
      .on("error", (error) => {
        console.error(`Error parsing PNG file ${pathIn}: ${error}`);
        reject(error);
      });
  });
};

const invert = async (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    fs.promises
      .mkdir(path.dirname(pathOut), { recursive: true })
      .catch((error) => {
        console.error("Error while creating directory:", error);
        reject(error);
      });
    fs.createReadStream(pathIn)
      .pipe(new PNG())
      .on("parsed", function () {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            this.data[idx] = 255 - this.data[idx];
            this.data[idx + 1] = 255 - this.data[idx + 1];
            this.data[idx + 2] = 255 - this.data[idx + 2];
          }
        }

        this.pack()
          .pipe(fs.createWriteStream(pathOut))
          .on("finish", () => {
            console.log(`Inverted conversion completed for ${pathIn}`);
            resolve();
          })
          .on("error", (error) => {
            console.error(
              `Error writing inverted image for ${pathIn}: ${error}`
            );
            reject(error);
          });
      })
      .on("error", (error) => {
        console.error(`Error parsing PNG file ${pathIn}: ${error}`);
        reject(error);
      });
  });
};

const userMenu = () => {
  console.log("1. Grayscale");
  console.log("2. Sepia");
  console.log("3. Inverted");
  console.log("4. Dithering");
  console.log("5. Exit");
};

module.exports = {
  unzip,
  readDir,
  grayScale,
  sepia,
  invert,
  userMenu,
};
