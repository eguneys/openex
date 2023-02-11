import { at, Bot as BotApi, Challenge as ChallengeApi } from 'apil';
import { canAccept, AcceptOptions, acceptConfig } from './accept';
import Play from './play';
import PlayOnTurn, { IPlayer } from './playonturn';

export default class Bot {

  static make = (botId: string, token: string, player: IPlayer) => new Bot(botId, token, player);
  
  botId: string
  token: string
  api: BotApi
  challenge: ChallengeApi
  plays: Map<at.GameId, Play>
  player: IPlayer

  constructor(botId: string, token: string, player: IPlayer) {
    this.botId = botId;
    this.token = token;
    this.player = player;

    let auth = { token };

    this.api = new BotApi(auth);
    this.challenge = new ChallengeApi(auth);
    this.plays = new Map();
  }

  async respondChallenge(id: at.ChallengeId, reason?: at.DeclineReason) {
    if (this.plays.size > 2) {
      if (!reason) {
        reason = 'later';
      }
    }
    if (!reason) {
      this.challenge.accept(id);
    } else {
      this.challenge.decline(id, reason);
    }
  }

  respondGameStart(id: at.GameId) {
    let play = PlayOnTurn.make(this.botId, this.token, id, this.player);

    play.play().then(() => {
      this.plays.delete(id);
    }).catch(e => {});

    this.plays.set(id, play);
  }

  async acceptChallenges(acceptOptions: AcceptOptions,
                         timeout: number = 15 * 60 * 1000) {
    let config = acceptConfig(acceptOptions);

    try {
    let { abort,
          response } = await this.api.incomingEvents();

    response.on('data', data => {
      if (at.isGameStart(data)) {
        this.respondGameStart(data.game.id);
      } else if (at.isGameFinish(data)) {
      } else if (at.isChallenge(data)) {
        let reason = canAccept(data, config);
        this.respondChallenge(data.challenge.id, reason);
      }
    });

    await new Promise<void>(resolve => {
      setTimeout(() => {
        abort();
        resolve();
      }, timeout);
    });
    
    } catch (e) {

      throw e
    }
  }
  
}
