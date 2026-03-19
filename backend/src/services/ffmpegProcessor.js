const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

/**
 * FFmpeg Processor Service: Concat clips and submix audio.
 */
class FFmpegProcessor {
  /**
   * Concatenate clips and merge final audio.
   */
  async assembleFinalVideo(clips, audioFile, outputFileName) {
    return new Promise((resolve, reject) => {
      let command = ffmpeg();

      // Add each clip
      clips.forEach(clip => {
        command = command.input(clip);
      });

      // Merge and add audio
      command
        .on("error", (err) => reject(err))
        .on("end", () => resolve(outputFileName))
        .mergeToFile(outputFileName, "/tmp/")
        .addInput(audioFile)
        .audioCodec("aac")
        .videoCodec("libx264")
        .outputOptions("-pix_fmt yuv420p");
    });
  }
}

module.exports = new FFmpegProcessor();
