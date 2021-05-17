import { IPlayer } from './playonturn';
import Bot from './bot';
import Psu from './psu';

export default async function app(config: any) {

  let { token,
        botId,
        acceptOptions,
        timeout,
        enginePath } = config;

  let psu: IPlayer = Psu.make(enginePath);

  let bot = Bot.make(botId, token, psu);

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

