import React, { useCallback, useMemo, useState } from "react";
import "./App.css";

/**
 * Return the winner symbol ("X" or "O") if there is a winning line, else null.
 * @param {Array<"X"|"O"|null>} squares
 * @returns {"X"|"O"|null}
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // cols
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diagonals
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) return v;
  }
  return null;
}

/**
 * Return the indices of the winning line (length 3) if present, else null.
 * @param {Array<"X"|"O"|null>} squares
 * @returns {number[]|null}
 */
function getWinningLine(squares) {
  const lines = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // cols
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diagonals
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) return [a, b, c];
  }
  return null;
}

/**
 * Small helper to build className strings.
 * @param  {...(string|false|null|undefined)} parts
 * @returns {string}
 */
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Square({ value, onClick, disabled, highlight, index }) {
  return (
    <button
      type="button"
      className={cx("ttt-square", highlight && "is-winning")}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Square ${index + 1}${value ? `, ${value}` : ""}`}
    >
      <span className={cx("ttt-mark", value === "X" && "is-x", value === "O" && "is-o")}>
        {value ?? ""}
      </span>
    </button>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** @type {[Array<"X"|"O"|null>, Function]} */
  const [squares, setSquares] = useState(Array(9).fill(null));
  /** @type {["X"|"O", Function]} */
  const [nextPlayer, setNextPlayer] = useState("X");
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });

  const winner = useMemo(() => calculateWinner(squares), [squares]);
  const winningLine = useMemo(() => getWinningLine(squares), [squares]);
  const isDraw = useMemo(() => !winner && squares.every(Boolean), [winner, squares]);
  const isGameOver = Boolean(winner || isDraw);

  const statusText = useMemo(() => {
    if (winner) return `Player ${winner} wins!`;
    if (isDraw) return "It's a draw!";
    return `Turn: Player ${nextPlayer}`;
  }, [winner, isDraw, nextPlayer]);

  const handleSquareClick = useCallback(
    (idx) => {
      if (isGameOver) return;
      if (squares[idx]) return;

      const next = squares.slice();
      next[idx] = nextPlayer;
      setSquares(next);

      const maybeWinner = calculateWinner(next);
      const maybeDraw = !maybeWinner && next.every(Boolean);

      if (maybeWinner) {
        setScore((s) => ({ ...s, [maybeWinner]: s[maybeWinner] + 1 }));
      } else if (maybeDraw) {
        setScore((s) => ({ ...s, draws: s.draws + 1 }));
      }

      setNextPlayer((p) => (p === "X" ? "O" : "X"));
    },
    [isGameOver, squares, nextPlayer]
  );

  // PUBLIC_INTERFACE
  const restartGame = useCallback(() => {
    setSquares(Array(9).fill(null));
    setNextPlayer("X");
  }, []);

  // PUBLIC_INTERFACE
  const resetScoreboard = useCallback(() => {
    setScore({ X: 0, O: 0, draws: 0 });
    setSquares(Array(9).fill(null));
    setNextPlayer("X");
  }, []);

  return (
    <div className="App">
      <main className="ttt-page">
        <section className="ttt-card" aria-label="Tic Tac Toe">
          <header className="ttt-header">
            <div className="ttt-title-wrap">
              <h1 className="ttt-title">Tic Tac Toe</h1>
              <p className="ttt-subtitle">Retro clean. Modern feel.</p>
            </div>

            <div className="ttt-score" aria-label="Scoreboard">
              <div className="ttt-score-item">
                <span className="ttt-score-label">X</span>
                <span className="ttt-score-value">{score.X}</span>
              </div>
              <div className="ttt-score-item">
                <span className="ttt-score-label">O</span>
                <span className="ttt-score-value">{score.O}</span>
              </div>
              <div className="ttt-score-item">
                <span className="ttt-score-label">Draws</span>
                <span className="ttt-score-value">{score.draws}</span>
              </div>
            </div>
          </header>

          <div className="ttt-status" role="status" aria-live="polite">
            <span className={cx("ttt-status-pill", winner && "is-win", isDraw && "is-draw")}>
              {statusText}
            </span>
          </div>

          <div className="ttt-board-wrap">
            <div className="ttt-board" role="grid" aria-label="3 by 3 tic tac toe board">
              {squares.map((v, idx) => (
                <Square
                  key={idx}
                  index={idx}
                  value={v}
                  disabled={isGameOver || Boolean(v)}
                  highlight={Boolean(winningLine && winningLine.includes(idx))}
                  onClick={() => handleSquareClick(idx)}
                />
              ))}
            </div>
          </div>

          <footer className="ttt-controls" aria-label="Controls">
            <button type="button" className="ttt-btn ttt-btn-primary" onClick={restartGame}>
              New game
            </button>
            <button type="button" className="ttt-btn ttt-btn-ghost" onClick={resetScoreboard}>
              Reset score
            </button>
          </footer>

          <p className="ttt-hint">
            Tip: First to three in a row wins. Winning line highlights automatically.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
