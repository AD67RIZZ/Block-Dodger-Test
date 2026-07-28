import { a as require_react, o as __toESM, t as require_jsx_runtime } from "../index.js";
//#region app/page.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var WORLD_W = 720;
var WORLD_H = 560;
var PLAYER_SIZE = 34;
function Home() {
	const canvasRef = (0, import_react.useRef)(null);
	const stateRef = (0, import_react.useRef)("ready");
	const keysRef = (0, import_react.useRef)({
		left: false,
		right: false
	});
	const playerRef = (0, import_react.useRef)({
		x: WORLD_W / 2 - PLAYER_SIZE / 2,
		y: WORLD_H - 62
	});
	const blocksRef = (0, import_react.useRef)([]);
	const lastRef = (0, import_react.useRef)(0);
	const spawnRef = (0, import_react.useRef)(0);
	const elapsedRef = (0, import_react.useRef)(0);
	const rafRef = (0, import_react.useRef)(0);
	const [gameState, setGameState] = (0, import_react.useState)("ready");
	const [score, setScore] = (0, import_react.useState)(0);
	const [best, setBest] = (0, import_react.useState)(0);
	const changeState = (0, import_react.useCallback)((next) => {
		stateRef.current = next;
		setGameState(next);
	}, []);
	const startGame = (0, import_react.useCallback)(() => {
		playerRef.current.x = WORLD_W / 2 - PLAYER_SIZE / 2;
		blocksRef.current = [];
		elapsedRef.current = 0;
		spawnRef.current = 0;
		lastRef.current = performance.now();
		setScore(0);
		changeState("playing");
	}, [changeState]);
	const togglePause = (0, import_react.useCallback)(() => {
		if (stateRef.current === "playing") changeState("paused");
		else if (stateRef.current === "paused") {
			lastRef.current = performance.now();
			changeState("playing");
		}
	}, [changeState]);
	(0, import_react.useEffect)(() => {
		setBest(Number(localStorage.getItem("dodge-blocks-best") || 0));
	}, []);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const stars = Array.from({ length: 55 }, (_, i) => ({
			x: i * 137.5 % WORLD_W,
			y: i * 89.3 % WORLD_H,
			r: i % 7 === 0 ? 1.5 : .8
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
		const loop = (now) => {
			const dt = Math.min((now - lastRef.current) / 1e3, .035);
			lastRef.current = now;
			if (stateRef.current === "playing") {
				elapsedRef.current += dt;
				spawnRef.current += dt;
				const difficulty = Math.min(elapsedRef.current / 35, 1);
				const playerSpeed = 390;
				if (keysRef.current.left) playerRef.current.x -= playerSpeed * dt;
				if (keysRef.current.right) playerRef.current.x += playerSpeed * dt;
				playerRef.current.x = Math.max(8, Math.min(WORLD_W - PLAYER_SIZE - 8, playerRef.current.x));
				const interval = .72 - difficulty * .35;
				if (spawnRef.current >= interval) {
					spawnRef.current = 0;
					const size = 25 + Math.random() * 36;
					blocksRef.current.push({
						x: 8 + Math.random() * (WORLD_W - size - 16),
						y: -size,
						w: size,
						h: size * (.72 + Math.random() * .55),
						speed: 190 + Math.random() * 75 + difficulty * 185
					});
				}
				const p = playerRef.current;
				blocksRef.current.forEach((b) => b.y += b.speed * dt);
				const hit = blocksRef.current.some((b) => p.x < b.x + b.w && p.x + PLAYER_SIZE > b.x && p.y < b.y + b.h && p.y + PLAYER_SIZE > b.y);
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
	(0, import_react.useEffect)(() => {
		const onKey = (pressed) => (event) => {
			if ([
				"ArrowLeft",
				"ArrowRight",
				" ",
				"a",
				"d",
				"A",
				"D"
			].includes(event.key)) event.preventDefault();
			if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keysRef.current.left = pressed;
			if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keysRef.current.right = pressed;
			if (pressed && event.key === " ") if (stateRef.current === "ready" || stateRef.current === "over") startGame();
			else togglePause();
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
	const hold = (direction, pressed) => {
		keysRef.current[direction] = pressed;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "game-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "brand",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "logo",
					children: "D"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: ["DODGE ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "THE BLOCKS" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "STAY SHARP. STAY ALIVE." })] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "pause",
				onClick: togglePause,
				disabled: gameState === "ready" || gameState === "over",
				"aria-label": "Pause game",
				children: gameState === "paused" ? "▶" : "Ⅱ"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stats",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SCORE" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: String(score).padStart(4, "0") })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "status",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: gameState === "playing" ? "live" : "" }),
							" ",
							gameState === "playing" ? "RUNNING" : gameState.toUpperCase()
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "BEST" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: String(best).padStart(4, "0") })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "arena",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					width: WORLD_W,
					height: WORLD_H,
					"aria-label": "Dodge the Blocks game area"
				}), gameState !== "playing" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overlay",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: gameState === "over" ? "SIGNAL LOST" : gameState === "paused" ? "GAME PAUSED" : "WELCOME, PILOT"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: gameState === "over" ? "BLOCKED!" : gameState === "paused" ? "TAKE A BREATH" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							"DON'T GET",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "CRUSHED." })
						] }) }),
						gameState === "over" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["You survived for ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [(score / 10).toFixed(1), " seconds"] })] }),
						gameState === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Move the mint square. Dodge every red block.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"It gets faster the longer you survive."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: gameState === "paused" ? togglePause : startGame,
							children: [
								gameState === "over" ? "TRY AGAIN" : gameState === "paused" ? "RESUME" : "START RUN",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "→" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: gameState === "ready" ? "PRESS SPACE TO START" : "PRESS SPACE" })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onPointerDown: () => hold("left", true),
						onPointerUp: () => hold("left", false),
						onPointerLeave: () => hold("left", false),
						"aria-label": "Move left",
						children: "←"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "MOVE" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Arrow keys or A / D" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onPointerDown: () => hold("right", true),
						onPointerUp: () => hold("right", false),
						onPointerLeave: () => hold("right", false),
						"aria-label": "Move right",
						children: "→"
					})
				]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "◈" }),
		" SPEED INCREASES OVER TIME ",
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
		" SURVIVE AS LONG AS YOU CAN"
	] })] });
}
//#endregion
export { Home as default };
