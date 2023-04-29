// Import required modules
const fetch = require("isomorphic-unfetch");
const { getData, getPreview, getTracks, getDetails } = require("spotify-url-info")(fetch);
const spotifyURI = require("spotify-uri");
const ytsr = require("ytsr");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

const supportedTypes = ["playlist", "track", "album"];

// Set up file path separators depending on the operating system
const isWin = process.platform === "win32";
const slash = !isWin ? "/" : "\\";

module.exports = {
  /**
   * Returns a YouTube URL to play music with the "play" property of your preferred music npm.
   * @param {String} url Spotify URL
   * @returns YouTube Info
   */
  trackGet: async url => {
    await validateURL(url);
    let data = await getData(url);

    if (data.type === "track") {
      let query = `${data.name} ${data.artists.map(x => x.name).join(" ")}`;
      let search = await ytsr(query, { limit: 1 });

      if (!search) {
        console.log("\x1b[31m%s\x1b[0m", "Found no results from YouTube");
        process.exit(0);
      }
      return {
        url: search[0].url,
        info: search
      };
    } else {
      console.log("\x1b[31m%s\x1b[0m", "The URL type is invalid!");
      process.exit(0);
    }
  },

  /**
   * Returns an Array of YouTube music URL's to play a playlist with your preferred music npm.
   * @param {String} url Spotify URL
   * @returns Array with YouTube URL's
   */
  playListGet: async url => {
    await validateURL(url);
    let data = await getData(url);
    let tracks = await getTracks(url);
    let details = await getDetails(url);

    if (data.type !== "playlist" && data.type !== "album") {
      console.log("\x1b[31m%s\x1b[0m", "The URL is invalid!");
      process.exit(0);
    }

    try {
      const songs = [];

      for (const song of tracks) {
        if (song) {
          console.log(`Fetching ${song.name} ${song.artist}`);
          let search = await ytsr(`${song.name} ${song.artist} audio`, {
            limit: 1
          });
          let preview = await getDetails(song.uri);

          songs.push({
            album: data.type === "album" ? data.title : undefined,
            cover: preview.preview.image,
            artist: String(song.artist),
            title: String(song.name),
            url: search.items[0].url
          });
        }
      }

      const infoPlayList = await getData(url);
      return {
        songs: songs,
        info: infoPlayList
      };
    } catch (e) {
      console.log("\x1b[31m%s\x1b[0m", "An error occured while trying to get information from the playlist:\n" + e);
      process.exit(0);
    }
  },

  /**
   * Download a playlist from Spotify as audio files
   * @param {String} url Spotify URL
   * @param {String} outputDir Output directory
   */
  downloadPlaylist: async (url, outputDir) => {
    const playlist = await module.exports.playListGet(url);

    for (const song of playlist.songs) {
      const fileName = `${song.title}.mp3`;
      const filePath = !song.album ? outputDir + slash + song.artist + slash : outputDir + slash + song.artist + slash + song.album + slash;
      await downloadSong(song, filePath, fileName);
    }
  }
};

// Validate the Spotify URL
async function validateURL(url) {
  if (!url || typeof url !== "string") {
    console.log("\x1b[31m%s\x1b[0m", "You did not specify the URL of Spotify!");
    process.exit(0);
  }

  let regexp = /(https?:\/\/open.spotify.com\/(playlist|track|album)\/[a-zA-Z0-9]+|spotify:(playlist|track|album):[a-zA-Z0-9])/g;

  if (regexp.test(url)) {
    try {
      const parsedURL = spotifyURI.parse(url);

      if (!supportedTypes.includes(parsedURL.type)) {
        console.log("\x1b[31m%s\x1b[0m", "The specified URL is not of a valid type. Valid types: " + supportedTypes.join(", "));
        process.exit(0);
      }
      return true;
    } catch (e) {
      console.log("\x1b[31m%s\x1b[0m", e);
      process.exit(0);
    }
  } else {
    console.log("\x1b[31m%s\x1b[0m", "The link is invalid!");
    process.exit(0);
  }
}

/**
 * Download a song from YouTube
 * @param {Object} song Song information
 * @param {String} outputDir Output directory
 * @param {String} fileName File name
 */
async function downloadSong(song, outputDir, fileName) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, fileName.replaceAll(slash, " "));
  const audio = ytdl(song.url, { filter: "audioonly" });
  audio.pipe(fs.createWriteStream(filePath));

  audio.on("end", () => {
    console.log("\x1b[32m%s\x1b[0m", `Downloaded: `, filePath);
  });
}