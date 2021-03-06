import fs from 'fs';
import path from 'path';
import { IPlayer } from './playonturn';
import Bot from './bot';
import Psu from './psu';

export default async function app(config: any) {

  let { token,
        botId,
        acceptOptions,
        timeout,
        enginePath } = config;

  try {
    enginePath = path.join(__dirname, enginePath);
    if (!fs.existsSync(enginePath)) {
      throw new Error('Engine not found ' + enginePath);
    }
  } catch (e) {
    console.log(`Failed loading default engine ${e}`);
    process.exit(1); 
  }
  
  let psu: IPlayer = Psu.make(enginePath, token);

  let bot = Bot.make(botId, token, psu);

  try {
    await psu.init();    
  } catch (e) {
    console.log(`Failed loading default engine ${e}`);
    process.exit(1);
  }
  


  function step() {
    console.log(`Listening challenges..`);

    bot
      .acceptChallenges(acceptOptions, timeout)
      .then(step)
      .catch(e => {
        console.error(`[Fail accept challenges] ${e}`);
        process.exit(1);
      });
  }

  step();
  
}

