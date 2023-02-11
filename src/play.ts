import { at, Bot as BotApi } from 'apil';

export default abstract class Play {

  botId: string
  gameId: at.GameId
  fAbort?: () => void
  gameFull?: at.GameFull
  api: BotApi

  constructor(botId: string, token: string, id: at.GameId) {
    let auth = { token };

    this.botId = botId;
    this.gameId = id;
    this.api = new BotApi(auth);
  }

  async respondGameFull(data: at.GameFull) {
    this.gameFull = data;

    this.full(this.gameFull);

    this.respondGameState(this.gameFull.state);
  }

  async respondGameState(state: at.GameState) {
    if (!this.gameFull || state.status !== 'started') {
      this.respondGameAbort(state.status);
      return;
    }

    this.gameFull.state.moves = state.moves;

    this.state(state);      
  }

  async respondGameAbort(status: at.GameStatus) {
    try {
    await this.abort(status)
    this.fAbort?.();
    } catch (e) {}
  }

  move(uci: at.Uci, offeringDraw?: boolean) {
    return this.api.move(this.gameId, uci, offeringDraw)
      .catch(_ => console.error(`Move fail ${uci} : ${_.error}`));
  }

  chat(chat: string) {
    return this.api.chat(this.gameId, 'player', chat)
      .catch(_ => console.error(_))//console.error(`Chat fail ${chat} : ${_}`));
  }

  async play(timeout: number = 15 * 60 * 1000) {
    return this.api.gameState(this.gameId)
    .catch(e => { })
    .then(_ => {
      if (!_) {
        return
      }
      let { abort, response } = _

      response.on('data', data => {
        if (at.isGameFull(data)) {
          this.respondGameFull(data);
        } else if (at.isGameState(data)) {
          this.respondGameState(data);
        } else if (at.isChatLine(data)) {
          this.respondGameChat(data);
        }
      });

      response.on('error', () => {})


      return new Promise<void>(resolve => {
        this.fAbort = () => {
          try { 
          abort();
          } catch (e) {}
          resolve();
        };
        setTimeout(() => {
          try {
          abort();
          } catch (e) {}
          resolve();
        }, timeout);
      }).catch(e => {});
    }).catch(e => {})
  }

  abstract respondGameChat(data: at.ChatLine): Promise<void>;
  abstract full(full: at.GameFull): Promise<void>;
  abstract state(state: at.GameState): Promise<void>;
  abstract abort(status: at.GameStatus): Promise<void>;
  
}
