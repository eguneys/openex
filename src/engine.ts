import { at } from 'apil';
import PlayOnTurn, { IPlayer } from './playonturn';

import { Engine } from 'node-uci';

export default class EnginePlayer implements IPlayer {

  static make = (path: string) => new EnginePlayer(path);

  engine: Engine
  ready: boolean = false
  queue: Promise<boolean>
  
  constructor(path: string) {

    this.engine = new Engine(path);

    this.queue = Promise.resolve(true);
    
  }
  
  async init() {

    await this.engine.init();
    await this.engine.isready();

    this.ready = true;
  }

  private async quit() {
    await this.engine.quit();
    this.ready = false;
  }

  private async baseMove(position: string, moves: Array<string>) {
    if (!this.ready) {
      await this.init();
    }

    await this.engine.position(position, moves);
    return this.engine
      .go({ depth: 8 })
      .then(_ => _.bestmove);
  }
  
  async move(ctx: PlayOnTurn, position: string, moves: Array<string>) {
    this.queue = this.queue.then(async () => {
      let _ = await this.baseMove(position, moves)

      ctx.move(_);
      return true;
    });
    return this.queue;
  }
  
  async chat(ctx: PlayOnTurn, chat: at.ChatLine) {
    
  }
  
  async abort(ctx: PlayOnTurn, status: at.GameStatus) {

  }  
  
}
