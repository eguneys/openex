import { at } from 'apil';
import PlayOnTurn, { IPlayer } from './playonturn.js';
import StudyImport from './study.js';
//import { PamCache } from 'pampu';
import pkg from 'pampu'
const { PamCache } = pkg

type PamCache<A, B> = any

export default class Book implements IPlayer {

  static make = (token: string) => new Book(token);

  studies: PamCache<at.UserId, Promise<StudyImport>>
  
  constructor(token: string) {

    this.studies = new PamCache<at.UserId, Promise<StudyImport>>({
      size: 4,
      loader: _ => StudyImport.get(token, _)
    });
  }
  
  async init() {
  }
  
  async move(ctx: PlayOnTurn, position: string, moves: Array<string>) {
    let sim = await this.studies.get(ctx.opponent.id.toLowerCase());
    return sim.move(ctx, position, moves);
  }
  
  async chat(ctx: PlayOnTurn, chat: at.ChatLine) {
    let sim = await this.studies.get(chat.username.toLowerCase());
    return sim.maybeLoad(ctx, chat.text);
  }
  
  async abort(ctx: PlayOnTurn, status: at.GameStatus) {
    let sim = await this.studies.get(ctx.opponent.id.toLowerCase());
    sim.abort(status);
  }  
  
}
