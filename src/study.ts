import { at, StudyApi } from 'apil';
import MovePicker from './picker';
import PlayOnTurn from './playonturn';
import { Esrar, QPGN, Fen, fen_after_ucis } from 'chesstwo'

export default class StudyImport {

  static get = (token: string, userId: at.UserId) => Promise.resolve(new StudyImport(token));

  picker: MovePicker
  study: StudyApi
  
  constructor(token: string) {

    this.study = StudyApi.make({token});
    
    this.picker = new MovePicker();
  }

  setPgns(pgns: Array<QPGN>) {
    this.picker.setPgns(pgns);
  }

  abort(status: at.GameStatus) {
    this.picker.abort();
  }

  move(ctx: PlayOnTurn, position: string, moves: Array<string>) {
    let res = false;
    let fen = fen_after_ucis(position, moves);
    if (fen) {
      res = this.picker.pick(ctx, fen);
    } else {
      return Promise.reject(`Can't find fen after ucis ${position} ${moves}`);
    }
    return Promise.resolve(res);
  }

  async maybeLoad(ctx: PlayOnTurn, studyLink: string) {
    let chapterIdReg = /^https:\/\/lichess\.org\/study\/([A-Za-z0-9]{8})\/([A-Za-z0-9]{8})$/;
    let studyIdReg = /^https:\/\/lichess\.org\/study\/([A-Za-z0-9]{8})$/;

    let matchedReg = '';
    let pgns;
    let match = studyLink.match(chapterIdReg);

    console.log('maybeLoad', studyLink, match);
    if (match) {
      matchedReg = `${match[1]}/${match[2]}`;
      ctx.chat(`Loading ${match[1]}/${match[2]} ..`);
      pgns = await this.study.oneChapter(match[1], match[2]);
    } else {
      match = studyLink.match(studyIdReg);

      if (match) {
        matchedReg = `${match[1]}`;
        ctx.chat(`Loading ${match[1]} ..`);
        pgns = await this.study.allChapters(match[1]);
      }
    }

    try {
      if (pgns) {
        let builder = Esrar(pgns);
        this.setPgns(builder.pgns);
        ctx.chat(`Loaded ${builder.pgns.length} pgns`);
      } else {
        console.warn(`No pgns in study ${match}`)
      }
    } catch (e) {
      ctx.chat(`Couldnt load study from: ${matchedReg}`);
    }
  }
  
}
