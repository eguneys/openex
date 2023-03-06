import PlayOnTurn from './playonturn.js';
//import { QPGN, QMove, move_uci } from 'chesstwo'
import pkg from 'chesstwo'
const { move_uci } = pkg
type QPGN = any
type QMove = any


function almostEqual(fen: string, key: string) {
  let fs = fen.split(' '),
    ks = key.split(' ');
  return fs[0] === ks[0] && fs[1] === ks[1];
}

function qFen(pgn: QPGN, fen: string) {
  for (let key of pgn.fens.keys()) {
    if (almostEqual(fen, key)) {
      return pgn.fens.get(key);
    }
  }
}

export type QScore = {
  ply: number,
  maxPly: number
}

function qScore(pgn: QPGN, move: QMove): QScore {
  return {
    ply: move.ply,
    maxPly: move.maxPly || move.ply
  }
}


function qUci(move: QMove) {
  return move_uci(move.move)
}

export default class MovePicker {

  static make = () => new MovePicker();
  
  pgns: Array<QPGN>
  lastPgn?: QPGN
  lastMove?: QMove

  constructor() {
    this.pgns = [];
  }

  tag(pgn: QPGN) {
    return pgn.tags.get('Event');
  }

  abort() {
    this.lastPgn = undefined;
    this.lastMove = undefined;
  }

  setPgns(pgns: Array<QPGN>) {
    this.pgns = pgns;
  }
  
  randomBuckets: Map<number, Array<number>> = (() => {
    let _res = new Map<number, Array<number>>();
    for (let n = 0; n < 10; n++) {
      let res = [];
      for (let i = 0; i < n; i++) {
        for (let j = (n - i); j >= 0; j--) {
          res.push(i);
        }
      }
      _res.set(n, res);
    }
    return _res;
  })();
  
  private pickFromQMoves(moves: Array<QMove>) {
    let ns = this.randomBuckets.get(moves.length) || [0];
    return moves[ns[Math.floor(Math.random()*ns.length)]];
  }

  pick(ctx: PlayOnTurn, fen: string) {

    let move: string | undefined;

    if (!this.lastPgn) {
      this.lastPgn = this.pgns.find(_ => qFen(_, fen));

      if (this.lastPgn) {
        ctx.chat(`Entering ${this.tag(this.lastPgn)}`);
      }
    }

    if (this.lastPgn) {
      let qmoves = qFen(this.lastPgn, fen);

      if (qmoves) {
        let qmove = this.pickFromQMoves(qmoves);
        if (qmove) {
          move = qUci(qmove);
          this.lastMove = qmove;
        }
      }
      
      if (move) {
        ctx.move(move);
        return true;
      } else {
        if (this.lastMove) {
          let score = qScore(this.lastPgn, this.lastMove);

          this.lastMove = undefined;

          ctx.chat(`Out of book now. Score: ${score.ply}/${score.maxPly}`);
          ctx.offerDrawNextMove = true;
        }
      }
    }
    return false;
  }

  
  
}
