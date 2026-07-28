"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GameState = "ready" | "playing" | "paused" | "over";
type Block = { x: number; y: number; w: number; h: number; speed: number };

const WORLD_W = 720;
const WORLD_H = 560;
const PLAYER_SIZE = 34;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>("ready");
  const keysRef = useRef({ left: false, right: false });
  const playerRef = useRef({ x: WORLD_W / 2 - PLAYER_SIZE / 2, y: WORLD_H - 62 });
  const blocksRef = useRef<Block[]>([]);
  const lastRef = useRef(0);
  const spawnRef = useRef(0);
  const elapsedRef = useRef(0);
  const rafRef = useRef(0);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const changeState = useCallback((next: GameState) => {
    stateRef.current = next;
    setGameState(next);
  }, []);

  const startGame = useCallback(() => {
    playerRef.current.x = WORLD_W / 2 - PLAYER_SIZE / 2;
    blocksRef.current = [];
    elapsedRef.current = 0;
    spawnRef.current = 0;
    lastRef.current = performance.now();
    setScore(0);
    changeState("playing");
  }, [changeState]);

  const togglePause = useCallback(() => {
    if (stateRef.current === "playing") changeState("paused");
    else if (stateRef.current === "paused") {
      lastRef.current = performance.now();
      changeState("playing");
    }
  }, [changeState]);

  useEffect(() => {
    const stored = Number(localStorage.getItem("dodge-blocks-best") || 0);
    setBest(stored);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars = Array.from({ length: 55 }, (_, i) => ({
      x: (i * 137.5) % WORLD_W,
      y: (i * 89.3) % WORLD_H,
      r: i % 7 === 0 ? 1.5 : 0.8,
    }));

    const draw = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, WORLD_H);
      gradient.addColorStop(0, "#080c1e");
      gradient.addColorStop(1, "#11193b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);

      ctx.fillStyle = "rgba(255,255,255,.38)";
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = "rgba(118,255,218,.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < WORLD_W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, WORLD_H);
        ctx.stroke();
      }

      blocksRef.current.forEach((b) => {
        ctx.shadowColor = "#ff416c";
        ctx.shadowBlur = 16;
        ctx.fillStyle = "#ff416c";
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,.25)";
        ctx.fillRect(b.x + 4, b.y + 4, b.w - 8, 4);
      });

      const p = playerRef.current;
      ctx.shadowColor = "#65ffd3";
      ctx.shadowBlur = 22;
      ctx.fillStyle = "#65ffd3";
      ctx.fillRect(p.x, p.y, PLAYER_SIZE, PLAYER_SIZE);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#081325";
      ctx.fillRect(p.x + 8, p.y + 9, 5, 5);
      ctx.fillRect(p.x + 21, p.y + 9, 5, 5);
    };

    const loop = (now: number) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.035);
      lastRef.current = now;

      if (stateRef.current === "playing") {
        elapsedRef.current += dt;
        spawnRef.current += dt;
        const difficulty = Math.min(elapsedRef.current / 35, 1);
        const playerSpeed = 390;
        if (keysRef.current.left) playerRef.current.x -= playerSpeed * dt;
        if (keysRef.current.right) playerRef.current.x += playerSpeed * dt;
        playerRef.current.x = Math.max(8, Math.min(WORLD_W - PLAYER_SIZE - 8, playerRef.current.x));

        const interval = 0.72 - difficulty * 0.35;
        if (spawnRef.current >= interval) {
          spawnRef.current = 0;
          const size = 25 + Math.random() * 36;
          blocksRef.current.push({
            x: 8 + Math.random() * (WORLD_W - size - 16),
            y: -size,
            w: size,
            h: size * (0.72 + Math.random() * 0.55),
            speed: 190 + Math.random() * 75 + difficulty * 185,
          });
        }

        const p = playerRef.current;
        blocksRef.current.forEach((b) => (b.y += b.speed * dt));
        const hit = blocksRef.current.some(
          (b) => p.x < b.x + b.w && p.x + PLAYER_SIZE > b.x && p.y < b.y + b.h && p.y + PLAYER_SIZE > b.y,
        );
        blocksRef.current = blocksRef.current.filter((b) => b.y < WORLD_H + 70);

        const nextScore = Math.floor(elapsedRef.current * 10);
        setScore(nextScore);
        if (hit) {
          const newBest = Math.max(nextScore, Number(localStorage.getItem("dodge-blocks-best") || 0));
          localStorage.setItem("dodge-blocks-best", String(newBest));
          setBest(newBest);
          changeState("over");
        }
      }

      draw();
      rafRef.current = requestAnimationFrame(loop);
    };

    draw();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [changeState]);

  useEffect(() => {
    const onKey = (pressed: boolean) => (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", " ", "a", "d", "A", "D"].includes(event.key)) event.preventDefault();
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keysRef.current.left = pressed;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keysRef.current.right = pressed;
      if (pressed && event.key === " ") {
        if (stateRef.current === "ready" || stateRef.current === "over") startGame();
        else togglePause();
      }
    };
    const down = onKey(true);
    const up = onKey(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [startGame, togglePause]);

  const hold = (direction: "left" | "right", pressed: boolean) => {
    keysRef.current[direction] = pressed;
  };

  return (
    <main>
      <section className="game-shell">
        <header>
          <div className="brand">
            <span className="logo">D</span>
            <div><h1>DODGE <em>THE BLOCKS</em></h1><p>STAY SHARP. STAY ALIVE.</p></div>
          </div>
          <button className="pause" onClick={togglePause} disabled={gameState === "ready" || gameState === "over"} aria-label="Pause game">
            {gameState === "paused" ? "▶" : "Ⅱ"}
          </button>
        </header>

        <div className="stats">
          <div><span>SCORE</span><strong>{String(score).padStart(4, "0")}</strong></div>
          <div className="status"><i className={gameState === "playing" ? "live" : ""} /> {gameState === "playing" ? "RUNNING" : gameState.toUpperCase()}</div>
          <div><span>BEST</span><strong>{String(best).padStart(4, "0")}</strong></div>
        </div>

        <div className="arena">
          <canvas ref={canvasRef} width={WORLD_W} height={WORLD_H} aria-label="Dodge the Blocks game area" />
          {gameState !== "playing" && (
            <div className="overlay">
              <span className="eyebrow">{gameState === "over" ? "SIGNAL LOST" : gameState === "paused" ? "GAME PAUSED" : "WELCOME, PILOT"}</span>
              <h2>{gameState === "over" ? "BLOCKED!" : gameState === "paused" ? "TAKE A BREATH" : <>DON&apos;T GET<br/><em>CRUSHED.</em></>}</h2>
              {gameState === "over" && <p>You survived for <b>{(score / 10).toFixed(1)} seconds</b></p>}
              {gameState === "ready" && <p>Move the mint square. Dodge every red block.<br/>It gets faster the longer you survive.</p>}
              <button onClick={gameState === "paused" ? togglePause : startGame}>
                {gameState === "over" ? "TRY AGAIN" : gameState === "paused" ? "RESUME" : "START RUN"} <span>→</span>
              </button>
              <small>{gameState === "ready" ? "PRESS SPACE TO START" : "PRESS SPACE"}</small>
            </div>
          )}
        </div>

        <div className="controls">
          <button onPointerDown={() => hold("left", true)} onPointerUp={() => hold("left", false)} onPointerLeave={() => hold("left", false)} aria-label="Move left">←</button>
          <p><b>MOVE</b><span>Arrow keys or A / D</span></p>
          <button onPointerDown={() => hold("right", true)} onPointerUp={() => hold("right", false)} onPointerLeave={() => hold("right", false)} aria-label="Move right">→</button>
        </div>
      </section>
      <footer><span>◈</span> SPEED INCREASES OVER TIME <i/> SURVIVE AS LONG AS YOU CAN</footer>
    </main>
  );
}
