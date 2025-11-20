export interface Vector {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameObject {
  pos: Vector;
  size: Size;
  color: string;
}

export interface Player extends GameObject {
  id: string;
  name: string;
  velocity: Vector;
  isGrounded: boolean;
  colorBody: string;
  colorDetail?: string; // White chest for Marusya
  facingRight: boolean;
}

export interface Platform extends GameObject {
  type: 'normal' | 'wall';
}

export interface GameState {
  status: 'menu' | 'playing' | 'won';
}
