// Adapted from https://github.com/qgustavor/mkv-extract/ licensed under MIT
const fs = window.require("fs"),
  matroska = window.require("matroska-subtitles"),
  pipeline = window.require("stream").pipeline;
function handleFile(file, atData) {
  if (!fs.existsSync(file))
    return;
  let fileLength = fs.statSync(file).size,
    fileStream = fs.createReadStream(file),
    decoder = createDecoderFromStream(fileStream, atData);
  return {
    startAt(fraction) {
      return; //not working at the minute :(
      console.log('starting at', fraction, Math.round(fileLength * fraction), fileLength, decoder);
      fileStream = fs.createReadStream(null, { fs: fileStream.fs, start: Math.round(fileLength * fraction) });
      decoder.decoder = new matroska(decoder.decoder);
      fileStream.pipe(decoder.decoder);
    },
    destroy: () => fileStream.destroy()
  }
}

function createDecoderFromStream(stream, atData, alreadyLoaded = {}, prevDecoder) {
  const matroskaDecoder = new matroska(prevDecoder),
    tracks = alreadyLoaded;
  window.tracks = tracks;
  matroskaDecoder.once("tracks", subTracks => subTracks.forEach(track => {
    if (!(track.number in tracks))
      tracks[track.number] = track;
  }));
  let emitTimeout,
    emitTimeoutStop = false,
    emitTimeoutMiliseconds = 5000,
    thereIsAnEmitWaiting = false;
  matroskaDecoder.on("subtitle", (subtitle, trackNumber) => {
    let track = tracks[trackNumber];
    if (!track.subtitles)
      track.subtitles = [];
    if (!track.subtitles.some(ele => JSON.stringify(ele) === JSON.stringify(subtitle)))
      track.subtitles.push(subtitle);
    thereIsAnEmitWaiting = true;
    if (emitTimeoutStop) return;
    thereIsAnEmitWaiting = false;
    emitTimeoutStop = true;
    clearTimeout(emitTimeout);
    emitTimeout = setTimeout(() => {
      emitTimeoutStop = false;
      if (thereIsAnEmitWaiting)
        emitData();
    }, emitTimeoutMiliseconds);
    emitData();
  });
  let onError = () => { };
  pipeline(
    stream,
    matroskaDecoder,
    err => onError(err)
  );
  return {
    destroy: () => stream.destroy(),
    decoder: matroskaDecoder,
    onError: (callback) => { onError = callback; },
    promise: new Promise(resolve => {
      matroskaDecoder.on("finish", () => { emitData(); resolve(tracks); });
    }),
    tracks
  };
  function emitData() {
    let files = [];
    Object.values(tracks).forEach(track => {
      const heading = track.header;
      const isASS = heading.includes("Format:");
      const formatFn = isASS ? formatTimestamp : formatTimestampSRT;
      const eventMatches = isASS
        ? heading.match(/\[Events\]\s+Format:([^\r\n]*)/)
        : [""];
      const headingParts = isASS ? heading.split(eventMatches[0]) : ["", ""];
      const fixedLines = [];
      if (track.subtitles)
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
      let data = (isASS ? headingParts[0] + eventMatches[0] + "\r\n" : "") + fixedLines.join("\r\n") + headingParts[1] + "\r\n",
        extName = isASS ? ".ass" : ".srt";
      files.push({
        name: track.language ? track.language + extName : "Subtitle " + track.number + extName,
        data,
        title: track.header.split("\n")[1].substring(7),
        tracks
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

export { handleFile };

