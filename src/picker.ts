import { erm, q } from 'esrar';
import PlayOnTurn from './playonturn';

export default class MovePicker {

  static make = () => new MovePicker();
  
  pgns: Array<erm.QPGN>
  lastPgn?: erm.QPGN
  lastMove?: erm.QMove

  constructor() {
    this.pgns = [];
  }

  tag(pgn: erm.QPGN) {
    return pgn.tags.get('Event');
  }

  abort() {
    this.lastPgn = undefined;
    this.lastMove = undefined;
  }

  setPgns(pgns: Array<erm.QPGN>) {
    this.pgns = pgns;
  }

  private pickFromQMoves(moves: Array<erm.QMove>) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  pick(ctx: PlayOnTurn, fen: string) {

    let move: string | undefined;

    
    if (!this.lastPgn) {
      this.lastPgn = this.pgns.find(_ => q.qFen(_, fen));

      if (this.lastPgn) {
        ctx.chat(`Entering ${this.tag(this.lastPgn)}`);
      }
    }

    if (this.lastPgn) {
      let qmoves = q.qFen(this.lastPgn, fen);

      if (qmoves) {
        let qmove = this.pickFromQMoves(qmoves);
        if (qmove) {
          move = q.qUci(qmove);
          this.lastMove = qmove;
        }
      }

      if (move) {
        ctx.move(move);
        return true;
      } else {
        if (this.lastMove) {
          let score = q.qScore(this.lastPgn, this.lastMove);

          this.lastMove = undefined;

          ctx.chat(`Out of book now. Score: ${score.ply}/${score.maxPly}`);
        }
      }
    }
    return false;
  }

  
  
}
