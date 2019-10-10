// Adapted from https://github.com/qgustavor/mkv-extract/ licensed under MIT
const fs = window.require("fs"),
  matroska = window.require("matroska-subtitles"),
  request = window.require("request");
function handleFile(file, atData) {
  createDecoderFromStream(fs.createReadStream(file), atData);
}

function handleURL(url, atData) {
  createDecoderFromStream(request(url), atData);
}

function createDecoderFromStream(stream, atData) {
  const matroskaDecoder = new matroska(),
    tracks = {};
  matroskaDecoder.once("tracks", subTracks => subTracks.forEach(track => tracks[track.number] = track));
  let emitTimeout,
    emitTimeoutStop = false,
    emitTimeoutMiliseconds = 5000;
  matroskaDecoder.on("subtitle", (subtitle, trackNumber) => {
    let track = tracks[trackNumber];
    if (!track.subtitles)
      track.subtitles = [];
    track.subtitles.push(subtitle);
    if (emitTimeoutStop) return;
    emitTimeoutStop = true;
    clearTimeout(emitTimeout);
    emitTimeout = setTimeout(() => emitTimeoutStop = false, emitTimeoutMiliseconds);
    emitData();
  });
  stream.pipe(matroskaDecoder);
  return new Promise(resolve => {
    matroskaDecoder.on("finish", () => { emitData(); resolve(tracks); });
  });
  function emitData() {
    let files = [];
    window.tracks = tracks;
    Object.values(tracks).forEach(track => {
      const heading = track.header;
      const isASS = heading.includes("Format:");
      const formatFn = isASS ? formatTimestamp : formatTimestampSRT;
      const eventMatches = isASS
        ? heading.match(/\[Events\]\s+Format:([^\r\n]*)/)
        : [""];
      const headingParts = isASS ? heading.split(eventMatches[0]) : ["", ""];
      const fixedLines = [];
      track.subtitles.forEach((subtitle, i) => {
        let startTimeStamp = formatFn(subtitle.time),
          endTimeStamp = formatFn(subtitle.time + subtitle.duration),
          lineParts = [subtitle.layer, startTimeStamp, endTimeStamp, subtitle.style,
          subtitle.name, subtitle.marginL, subtitle.marginR, subtitle.marginV, subtitle.effect, subtitle.text],
          fixedLine = isASS ? "Dialogue: " + lineParts.join(",")
            : i + 1 + "\r\n" + startTimeStamp.replace(".", ",") +
            " --> " + endTimeStamp.replace(".", ",") + "\r\n" + subtitle.text + "\r\n";
        if (fixedLines[i]) {
          fixedLines[i] += "\r\n" + fixedLine;
        } else {
          fixedLines[i] = fixedLine;
        }
      });
      let data = (isASS ? headingParts[0] + eventMatches[0] + "\r\n" : "") + fixedLines.join("\r\n") + headingParts[1] + "\r\n";
      files.push({
        name: "Subtitle_" + track.number + (isASS ? ".ass" : ".srt"),
        data
      });
    });
    atData(files);
  }
}

function formatTimestamp(timestamp) {
  const seconds = timestamp / 1000;
  const hh = Math.floor(seconds / 3600);
  let mm = Math.floor((seconds - hh * 3600) / 60);
  let ss = (seconds - hh * 3600 - mm * 60).toFixed(2);

  if (mm < 10) mm = `0${mm}`;
  if (ss < 10) ss = `0${ss}`;

  return `${hh}:${mm}:${ss}`;
}

function formatTimestampSRT(timestamp) {
  const seconds = timestamp / 1000;
  let hh = Math.floor(seconds / 3600);
  let mm = Math.floor((seconds - hh * 3600) / 60);
  let ss = (seconds - hh * 3600 - mm * 60).toFixed(3);

  if (hh < 10) hh = `0${hh}`;
  if (mm < 10) mm = `0${mm}`;
  if (ss < 10) ss = `0${ss}`;

  return `${hh}:${mm}:${ss}`;
}

export { handleFile, handleURL };

