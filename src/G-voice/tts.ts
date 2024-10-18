import gTTS from 'gtts';
import ffmpeg from 'fluent-ffmpeg';
import * as interfaces from '../interfaces/config-json.js';
import * as path from 'path';
import * as fs from 'fs';
import * as conf from '../configuration/conf.js';

export default async function gTts(text: string) {
   const mp3FilePath = path.join(
      path.resolve('dist/process-files'),
      'output.mp3',
   );
   const wavFilePath = path.join(
      path.resolve('dist/process-files'),
      'output.wav',
   );
   const rename = path.join(
      path.resolve('dist/process-files'),
      'output_last.wav',
   );

   if (fs.existsSync(rename)) {
      fs.rmSync(rename);
   }
   if (fs.existsSync(wavFilePath)) {
      fs.renameSync(wavFilePath, rename);
   }

   const config: interfaces.config = conf.readConfigFile();

   const generateMP3 = (): Promise<void> => {
      return new Promise((resolve, reject) => {
         const gtts = new gTTS(text, config.LANGUAGE);
         gtts.save(mp3FilePath, (err: Error) => {
            if (err) {
               console.error('°gTts: Error generating MP3 file: ', err);
               reject(err);
            } else {
               resolve();
            }
         });
      });
   };

   const convertMP3ToWAV = (): Promise<void> => {
      return new Promise((resolve, reject) => {
         ffmpeg(mp3FilePath)
            .toFormat('wav')
            .on('end', () => {
               if (fs.existsSync(mp3FilePath)) {
                  fs.rmSync(mp3FilePath);
               }
               resolve();
            })
            .on('error', (err: Error) => {
               console.error('Error during wav conversion:', err);
               reject(err);
            })
            .save(wavFilePath);
      });
   };

   await generateMP3()
      .then(() => convertMP3ToWAV())
      .then(() => {})
      .catch(err => {
         console.error('°gTts: Error during TTS processing: ', err);
      });
}
