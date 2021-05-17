import { at } from 'apil';
import Play from './play';

export interface IPlayer {
  init(): Promise<void>;
  move(ctx: PlayOnTurn, position: string, moves: Array<string>): Promise<boolean>;
  chat(ctx: PlayOnTurn, chat: at.ChatLine): Promise<void>;
  abort(ctx: PlayOnTurn, status: at.GameStatus): Promise<void>
  
}

export default class PlayOnTurn extends Play {

  static make = (botId: string,
                 token: string,
                 id: at.GameId,
                 player: IPlayer) => new PlayOnTurn(botId, token, id, player);


  player: IPlayer
  pov!: at.Color
  opponent!: at.User
  initialTurn!: at.Color
  initialFen!: at.Fen
  moves!: string
  status!: at.GameStatus
  
  constructor(botId: string, token: string, id: at.GameId, player: IPlayer) {
    super(botId,
          token,
          id);

    this.player = player;
  }

  async _move(turn: at.Color) {
    if (turn === this.pov) {
      let fen = this.initialFen,
      moves = this.moves === ''?[]:this.moves.split(' ');
      this.player.move(this, fen, moves);
    }
  }

  async _chat(_: at.ChatLine) {
    this.player.chat(this, _);
  }

  async _abort(_: at.GameStatus) {
    this.player.abort(this, _);
  }
  
  async full(data: at.GameFull) {

    this.pov = (data.white.id === this.botId) ? 'white' : 'black';
    this.opponent = data[oppositeColor(this.pov)];
    this.initialTurn = fenTurn(data.initialFen);

    this.moves = data.state.moves;
    this.status = data.state.status;
  }
  
  async state(data: at.GameState) {

    let evenTurn = (data.moves === '')|| data.moves.split(' ').length % 2 === 0,
    turn = evenTurn ? this.initialTurn : oppositeColor(this.initialTurn);

    this.moves = data.moves;
    this.status = data.status;

    this._move(turn);
  }

  async respondGameChat(data: at.ChatLine) {
    this._chat(data);
  }
  
  async abort(status: at.GameStatus) {
    this._abort(status);
  }

  
}

function fenTurn(fen: at.Fen) {
  if (fen === 'startpos') {
    return 'white';
  } else {
    let [_, color] = fen.split(' ');
    return color === 'w'? 'white':'black';
  }
}

function oppositeColor(color: at.Color) {
  return color === 'white' ? 'black' : 'white';
}
