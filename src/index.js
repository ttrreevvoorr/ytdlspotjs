const readline = require("readline");
const spotifyDownloader = require("./utils.js");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const isWin = process.platform === "win32";
let slash = isWin ? "\\" : "/";
let dir = "ytdlspot";

var DOWNLOAD_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  "downloads/"
);

const logo = `
\`YMM'   \`MM'MMP""MM""YMM \`7MM"""Yb. \`7MMF'           .M"""bgd \`7MM"""Mq.   .g8""8q.  MMP""MM""YMM 
  VMA   ,V  P'   MM   \`7   MM    \`Yb. MM            ,MI    "Y   MM   \`MM..dP'    \`YM.P'   MM   \`7 
   VMA ,V        MM        MM     \`Mb MM            \`MMb.       MM   ,M9 dM'      \`MM     MM      
    VMMP         MM        MM      MM MM              \`YMMNq.   MMmmdM9  MM        MM     MM      
     MM          MM        MM     ,MP MM      ,     .     \`MM   MM       MM.      ,MP     MM      
     MM          MM        MM    ,dP' MM     ,M     Mb     dM   MM       \`Mb.    ,dP'     MM      
   .JMML.      .JMML.    .JMMmmmdP' .JMMmmmmMMM     P"Ybmmd"  .JMML.       \`"bmmd"'     .JMML. 
                                              v1.0.1\n`;

console.log("\x1b[32m%s\x1b[0m", logo);
console.log(
  "Downloads songs via Youtube found from track names in a Spotify album or playlist URL\n"
);

rl.question("\x1b[1mSpotify Playlist or Album URL: \x1b[0m", (spotifyUrl) => {
  let url = spotifyUrl;

  rl.question(
    `\x1b[1mDownload path: (${path.resolve(".")}${slash}${dir}) \x1b[0m`,
    (desiredOut) => {
      if (desiredOut) {
        dir = desiredOut;
      }

      rl.close();
      spotifyDownloader.downloadPlaylist(url, dir);
    }
  );
});
