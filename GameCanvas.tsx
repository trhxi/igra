import React, { useEffect, useRef } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GRAVITY, 
  FRICTION, 
  MOVE_SPEED, 
  JUMP_FORCE, 
  PLAYER_SIZE,
  TARGET_SIZE,
  MARSIK_COLOR,
  MARUSYA_COLOR,
  MARUSYA_DETAIL,
  POLINA_HAIR,
  POLINA_DRESS,
  INITIAL_PLAYER_1_POS,
  INITIAL_PLAYER_2_POS,
  TARGET_POS
} from '../constants';
import { Player, Platform, Vector } from '../types';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

interface GameCanvasProps {
  onWin: () => void;
}

// Mobile Control Button Component
const ControlButton: React.FC<{
  icon: React.ReactNode;
  color: string;
  onPress: (active: boolean) => void;
}> = ({ icon, color, onPress }) => {
  return (
    <button
      className={`w-14 h-14 rounded-full flex items-center justify-center text-white 
        shadow-[0_4px_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 
        transition-all border-2 border-white/10 ${color}`}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress(true);
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        onPress(false);
      }}
      onPointerLeave={() => onPress(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {icon}
    </button>
  );
};

export const GameCanvas: React.FC<GameCanvasProps> = ({ onWin }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game State Refs (Mutable for game loop performance)
  const keys = useRef<Set<string>>(new Set());
  
  const players = useRef<[Player, Player]>([
    {
      id: 'p1',
      name: 'МАРСИК',
      pos: { ...INITIAL_PLAYER_1_POS },
      velocity: { x: 0, y: 0 },
      size: PLAYER_SIZE,
      color: '',
      colorBody: MARSIK_COLOR,
      isGrounded: false,
      facingRight: true,
    },
    {
      id: 'p2',
      name: 'МАРУСЯ',
      pos: { ...INITIAL_PLAYER_2_POS },
      velocity: { x: 0, y: 0 },
      size: PLAYER_SIZE,
      color: '',
      colorBody: MARUSYA_COLOR,
      colorDetail: MARUSYA_DETAIL,
      isGrounded: false,
      facingRight: true,
    }
  ]);

  // Level Design
  const platforms = useRef<Platform[]>([
    // Borders
    { pos: { x: 0, y: 580 }, size: { width: 800, height: 20 }, color: '#334155', type: 'normal' }, // Floor
    { pos: { x: 0, y: 0 }, size: { width: 800, height: 20 }, color: '#334155', type: 'normal' }, // Ceiling
    { pos: { x: 0, y: 0 }, size: { width: 20, height: 600 }, color: '#334155', type: 'wall' }, // Left Wall
    { pos: { x: 780, y: 0 }, size: { width: 20, height: 600 }, color: '#334155', type: 'wall' }, // Right Wall
    
    // Steps
    { pos: { x: 150, y: 480 }, size: { width: 150, height: 20 }, color: '#475569', type: 'normal' },
    { pos: { x: 400, y: 400 }, size: { width: 150, height: 20 }, color: '#475569', type: 'normal' },
    { pos: { x: 100, y: 300 }, size: { width: 150, height: 20 }, color: '#475569', type: 'normal' },
    { pos: { x: 300, y: 200 }, size: { width: 200, height: 20 }, color: '#475569', type: 'normal' },
    
    // Top Goal Platform
    { pos: { x: 600, y: 150 }, size: { width: 200, height: 20 }, color: '#475569', type: 'normal' },
  ]);

  const target = useRef({
    pos: { ...TARGET_POS },
    size: TARGET_SIZE
  });

  // --- Physics Engine ---

  const checkCollision = (rect1: {pos: Vector, size: {width: number, height: number}}, rect2: {pos: Vector, size: {width: number, height: number}}) => {
    return (
      rect1.pos.x < rect2.pos.x + rect2.size.width &&
      rect1.pos.x + rect1.size.width > rect2.pos.x &&
      rect1.pos.y < rect2.pos.y + rect2.size.height &&
      rect1.pos.y + rect1.size.height > rect2.pos.y
    );
  };

  const updatePlayer = (p: Player) => {
    // Input Handling
    if (p.id === 'p1') { // Marsik (WASD)
      if (keys.current.has('KeyA')) { p.velocity.x = -MOVE_SPEED; p.facingRight = false; }
      else if (keys.current.has('KeyD')) { p.velocity.x = MOVE_SPEED; p.facingRight = true; }
      else p.velocity.x *= FRICTION;

      if (keys.current.has('KeyW') && p.isGrounded) {
        p.velocity.y = JUMP_FORCE;
        p.isGrounded = false;
      }
    } else { // Marusya (Arrows)
      if (keys.current.has('ArrowLeft')) { p.velocity.x = -MOVE_SPEED; p.facingRight = false; }
      else if (keys.current.has('ArrowRight')) { p.velocity.x = MOVE_SPEED; p.facingRight = true; }
      else p.velocity.x *= FRICTION;

      if (keys.current.has('ArrowUp') && p.isGrounded) {
        p.velocity.y = JUMP_FORCE;
        p.isGrounded = false;
      }
    }

    // Apply Gravity
    p.velocity.y += GRAVITY;

    // Move X
    p.pos.x += p.velocity.x;
    
    // X Collision
    for (const plat of platforms.current) {
      if (checkCollision(p, plat)) {
        if (p.velocity.x > 0) { // Moving right
          p.pos.x = plat.pos.x - p.size.width;
        } else if (p.velocity.x < 0) { // Moving left
          p.pos.x = plat.pos.x + plat.size.width;
        }
        p.velocity.x = 0;
      }
    }

    // Move Y
    p.pos.y += p.velocity.y;
    p.isGrounded = false; // Assume falling until proven otherwise

    // Y Collision
    for (const plat of platforms.current) {
      if (checkCollision(p, plat)) {
        if (p.velocity.y > 0) { // Falling down
          p.pos.y = plat.pos.y - p.size.height;
          p.isGrounded = true;
        } else if (p.velocity.y < 0) { // Jumping up (hitting head)
          p.pos.y = plat.pos.y + plat.size.height;
        }
        p.velocity.y = 0;
      }
    }

    // Screen Boundaries (Safety Net)
    if (p.pos.y > CANVAS_HEIGHT) {
      p.pos.y = 0;
      p.velocity.y = 0;
    }
  };

  // --- Rendering ---

  const drawPlayer = (ctx: CanvasRenderingContext2D, p: Player) => {
    const { x, y } = p.pos;
    
    ctx.save();

    // Draw Name
    ctx.fillStyle = 'white';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(p.name, x + p.size.width / 2, y - 10);

    // Draw Tail (animated slightly by velocity)
    const tailWag = Math.sin(Date.now() / 200) * (Math.abs(p.velocity.x) > 0.1 ? 4 : 0);
    ctx.fillStyle = p.colorBody;
    if (p.facingRight) {
        ctx.fillRect(x - 4 + tailWag, y + 16, 4, 12); // Tail left
    } else {
        ctx.fillRect(x + p.size.width + tailWag, y + 16, 4, 12); // Tail right
    }

    // Draw Main Body
    ctx.fillStyle = p.colorBody;
    ctx.fillRect(x, y + 8, p.size.width, p.size.height - 8);

    // Draw Head
    ctx.fillRect(x - 2, y, p.size.width + 4, 16);

    // Draw Ears
    ctx.beginPath();
    // Left Ear
    ctx.moveTo(x, y);
    ctx.lineTo(x + 4, y - 6);
    ctx.lineTo(x + 8, y);
    // Right Ear
    ctx.moveTo(x + p.size.width, y);
    ctx.lineTo(x + p.size.width - 4, y - 6);
    ctx.lineTo(x + p.size.width - 8, y);
    ctx.fill();

    // Marusya's White Front (Tuxedo cat)
    if (p.colorDetail) {
      ctx.fillStyle = p.colorDetail;
      // Chest patch
      const chestWidth = 12;
      const chestX = x + (p.size.width - chestWidth) / 2;
      ctx.fillRect(chestX, y + 16, chestWidth, 10);
    }

    // Draw Face
    const eyeXOffset = p.facingRight ? 4 : -4;
    const centerX = x + p.size.width / 2;

    // Eyes (White part)
    ctx.fillStyle = 'white';
    ctx.fillRect(centerX - 6 + eyeXOffset, y + 6, 4, 4);
    ctx.fillRect(centerX + 2 + eyeXOffset, y + 6, 4, 4);

    // Pupils (Black)
    ctx.fillStyle = 'black';
    if (p.facingRight) {
        ctx.fillRect(centerX - 4 + eyeXOffset, y + 7, 2, 2);
        ctx.fillRect(centerX + 4 + eyeXOffset, y + 7, 2, 2);
    } else {
        ctx.fillRect(centerX - 6 + eyeXOffset, y + 7, 2, 2);
        ctx.fillRect(centerX + 2 + eyeXOffset, y + 7, 2, 2);
    }

    // Nose
    ctx.fillStyle = 'pink';
    ctx.fillRect(centerX - 1 + eyeXOffset, y + 11, 2, 2);

    // Paws (Bottom)
    ctx.fillStyle = 'white'; // White socks/paws are cute
    ctx.fillRect(x + 2, y + p.size.height - 4, 6, 4);
    ctx.fillRect(x + p.size.width - 8, y + p.size.height - 4, 6, 4);

    ctx.restore();
  };

  const drawPolina = (ctx: CanvasRenderingContext2D) => {
    const t = target.current;
    const { x, y } = t.pos;
    const w = t.size.width;
    const h = t.size.height;
    
    // Name Tag
    ctx.fillStyle = '#fca5a5'; // Light red/pink
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('ПОЛИНА', x + w / 2, y - 10);

    // --- Pixel Art Style Polina ---

    // Legs (Skin)
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(x + 8, y + h - 15, 6, 15); // Left leg
    ctx.fillRect(x + w - 14, y + h - 15, 6, 15); // Right leg

    // Shoes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 6, y + h - 4, 8, 4);
    ctx.fillRect(x + w - 16, y + h - 4, 8, 4);

    // Dress (Blue)
    ctx.fillStyle = POLINA_DRESS;
    // Skirt
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h - 12);
    ctx.lineTo(x + w - 2, y + h - 12);
    ctx.lineTo(x + w - 6, y + 20);
    ctx.lineTo(x + 6, y + 20);
    ctx.fill();
    
    // Torso
    ctx.fillRect(x + 6, y + 20, w - 12, 15);

    // Arms (Skin)
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(x + 2, y + 22, 4, 12); // Left arm
    ctx.fillRect(x + w - 6, y + 22, 4, 12); // Right arm

    // Head (Skin)
    ctx.fillRect(x + 6, y + 4, w - 12, 16);

    // Hair (Red "Kare" / Bob cut)
    ctx.fillStyle = POLINA_HAIR;
    
    // Top of hair
    ctx.fillRect(x + 4, y, w - 8, 6);
    
    // Left Side (Bob)
    ctx.fillRect(x + 2, y + 2, 6, 20);
    
    // Right Side (Bob)
    ctx.fillRect(x + w - 8, y + 2, 6, 20);

    // Bangs
    ctx.fillRect(x + 6, y + 2, w - 12, 4);

    // Face Features
    ctx.fillStyle = 'black';
    // Eyes
    ctx.fillRect(x + 10, y + 10, 2, 2);
    ctx.fillRect(x + w - 12, y + 10, 2, 2);
    
    // Smile
    ctx.fillStyle = '#be123c';
    ctx.fillRect(x + 13, y + 15, 6, 1);
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update Physics
    players.current.forEach(p => updatePlayer(p));

    // Check Win Condition
    const p1 = players.current[0];
    const p2 = players.current[1];
    const t = target.current;

    if (checkCollision(p1, t) && checkCollision(p2, t)) {
        onWin();
        return; // Stop loop
    }

    // Draw Background
    ctx.fillStyle = '#1e293b'; // Slate-800
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Platforms
    platforms.current.forEach(plat => {
      ctx.fillStyle = plat.color;
      ctx.fillRect(plat.pos.x, plat.pos.y, plat.size.width, plat.size.height);
      
      // Pixelated edges highlight
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.strokeRect(plat.pos.x + 2, plat.pos.y + 2, plat.size.width - 4, plat.size.height - 4);
      
      // Texture detail (bricks)
      ctx.fillStyle = '#334155';
      for(let i = 0; i < plat.size.width; i+=40) {
         ctx.fillRect(plat.pos.x + i, plat.pos.y + 4, 2, plat.size.height - 8);
      }
    });

    // Draw Polina
    drawPolina(ctx);

    // Draw Players
    players.current.forEach(p => drawPlayer(ctx, p));

    requestRef.current = requestAnimationFrame(loop);
  };

  // --- Lifecycle ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keys.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Touch Control Helpers
  const setKey = (code: string, active: boolean) => {
    if (active) keys.current.add(code);
    else keys.current.delete(code);
  };

  return (
    <div className="relative w-full max-w-[800px] mx-auto flex flex-col gap-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-auto border-4 border-slate-700 shadow-2xl bg-slate-800 rounded-lg block touch-none"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Mobile Controls - Visible only on screens smaller than lg (1024px) */}
      <div className="flex lg:hidden justify-between px-2 pb-8 gap-4 select-none touch-none">
         {/* Marsik (Left Side) */}
         <div className="flex flex-col items-center gap-1 bg-orange-900/20 p-2 rounded-xl border border-orange-500/30">
            <div className="text-orange-500 font-bold text-[10px] tracking-widest mb-1">МАРСИК</div>
            <div className="flex gap-3 items-end">
                <ControlButton icon={<ArrowLeft />} color="bg-orange-600 hover:bg-orange-500" onPress={(a) => setKey('KeyA', a)} />
                <div className="flex flex-col gap-3">
                    <ControlButton icon={<ArrowUp />} color="bg-orange-600 hover:bg-orange-500" onPress={(a) => setKey('KeyW', a)} />
                    <ControlButton icon={<ArrowRight />} color="bg-orange-600 hover:bg-orange-500" onPress={(a) => setKey('KeyD', a)} />
                </div>
            </div>
         </div>

         {/* Marusya (Right Side) */}
         <div className="flex flex-col items-center gap-1 bg-slate-700/30 p-2 rounded-xl border border-slate-500/30">
            <div className="text-slate-400 font-bold text-[10px] tracking-widest mb-1">МАРУСЯ</div>
            <div className="flex gap-3 items-end">
                 <div className="flex flex-col gap-3">
                    <ControlButton icon={<ArrowUp />} color="bg-slate-700 hover:bg-slate-600" onPress={(a) => setKey('ArrowUp', a)} />
                    <ControlButton icon={<ArrowLeft />} color="bg-slate-700 hover:bg-slate-600" onPress={(a) => setKey('ArrowLeft', a)} />
                 </div>
                 <ControlButton icon={<ArrowRight />} color="bg-slate-700 hover:bg-slate-600" onPress={(a) => setKey('ArrowRight', a)} />
            </div>
         </div>
      </div>
    </div>
  );
};
