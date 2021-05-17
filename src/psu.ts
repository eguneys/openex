import path from 'path';
import fs from 'fs';
import { at } from 'apil';
import PlayOnTurn, { IPlayer } from './playonturn';

import Engine from './engine';
import Book from './book';

export default class Psu implements IPlayer {

  static make = (enginePath: string) => new Psu(enginePath);
  
  stockfish: IPlayer
  book: IPlayer
  
  constructor(enginePath: string) {

    this.stockfish = Engine.make(enginePath);

    this.book = Book.make();
  }

  async init() {
    await this.stockfish.init();
    await this.book.init();
  }
  
  async move(ctx: PlayOnTurn, position: string, moves: Array<string>) {

    let handled = await this.book.move(ctx, position, moves)
    if (!handled) {

      return await this.stockfish.move(ctx, position, moves);
    }
    return handled;
  }
  
  async chat(ctx: PlayOnTurn, chat: at.ChatLine) {
    this.book.chat(ctx, chat);
  }
  
  async abort(ctx: PlayOnTurn, status: at.GameStatus) {
    this.book.abort(ctx, status);
    this.stockfish.abort(ctx, status);
  }  
}
