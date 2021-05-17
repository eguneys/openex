import { at } from 'apil';
import PlayOnTurn, { IPlayer } from './playonturn';
import StudyImport from './study';
import { PamCache } from 'pampu';

export default class Book implements IPlayer {

  static make = () => new Book();

  studies: PamCache<at.UserId, Promise<StudyImport>>
  
  constructor() {

    this.studies = new PamCache<at.UserId, Promise<StudyImport>>({
      size: 4,
      loader: StudyImport.get
    });
  }
  
  async init() {
  }
  
  async move(ctx: PlayOnTurn, position: string, moves: Array<string>) {
    let sim = await this.studies.get(ctx.opponent.id);
    return sim.move(ctx, position, moves);
  }
  
  async chat(ctx: PlayOnTurn, chat: at.ChatLine) {
    let sim = await this.studies.get(chat.username);
    return sim.maybeLoad(ctx, chat.text);
  }
  
  async abort(ctx: PlayOnTurn, status: at.GameStatus) {
    let sim = await this.studies.get(ctx.opponent.id);
    sim.abort(status);
  }  
  
}
