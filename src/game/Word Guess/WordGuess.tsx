"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useSubmitScore } from "@/lib/useSubmitScore";
import GameOverlay from "@/components/GameOverlay";

const MAX_TRIES = 6;
const WORD_LENGTH = 5;

// Comprehensive dictionary of common, fun 5-letter gaming, programming, and general nouns/verbs
const DICTIONARY = [
  "REACT", "COINS", "LEVEL", "SWEET", "SMART", "WORLD", "SPACE", "FLOOD", "SCORE", "FOCUS",
  "EXTRA", "BOARD", "MATCH", "CLUES", "SAGES", "TRICK", "COMBO", "BLOCK", "SUDOKU", "MINES",
  "PIXEL", "CLOCK", "TIMER", "SLIDE", "GRAVI", "CROWN", "FRAME", "LOOTY", "GAMES", "DAILY",
  "ADMIN", "EVENT", "GUEST", "SHINE", "GLOWY", "FLAME", "LASER", "PRISM", "AUDIO", "LIGHT",
  "SOUND", "MUSIC", "THEME", "STARS", "GEMSX", "STREK", "DRAFT", "TOUCH", "MOUSE", "SWIPE",
  "CHECK", "SOLID", "GLASS", "CLEAR", "STORM", "FORCE", "CLOUD", "CRAZE", "CHIPS", "BEATS",
  "SHIFT", "SOLVE", "SOLVR", "TRACE", "FIBER", "LOGIC", "PLAZA", "SHAPE", "SPLIT", "MATCH",
  "CUBES", "TILES", "TRAIL", "INDEX", "STACK", "BUILD", "DOCKR", "DRAFT", "PRODS", "LEADB",
  "SPEED", "CHAMP", "MEDAL", "BLITZ", "ROUND", "COUNT", "STAGE", "QUEST", "GUILD", "PARTY",
  "FLIPS", "CARDS", "BOARD", "SHELL", "ROUTE", "QUERY", "STORE", "STATE", "PROXY", "TOKEN",
  "FRONT", "CODES", "BYTES", "STACK", "PITCH", "GRAPH", "LOGIC", "SMILE", "SQUAD", "STRET",
  "POINT", "POWER", "BRAIN", "THINK", "MINDY", "GUESS", "WORDS", "PLOTS", "LINKS", "LINES"
];

function getRandomWord(): string {
  const idx = Math.floor(Math.random() * DICTIONARY.length);
  return DICTIONARY[idx];
}

export default function WordGuess() {
  const [secretWord, setSecretWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [seconds, setSeconds] = useState(0);

  const { submit, submitting, saved, reset } = useSubmitScore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  }, [stopTimer]);

  const initGame = useCallback(() => {
    stopTimer();
    setSecretWord(getRandomWord());
    setGuesses([]);
    setCurrentGuess("");
    setStatus("playing");
    setSeconds(0);
    reset();
    startTimer();
  }, [stopTimer, startTimer, reset]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initGame();
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute exact keyboard state highlights (Green > Yellow > Gray)
  const keyboardLettersState = useMemo(() => {
    const states: Record<string, "correct" | "present" | "absent"> = {};
    guesses.forEach((guess) => {
      for (let i = 0; i < guess.length; i++) {
        const char = guess[i];
        if (secretWord[i] === char) {
          states[char] = "correct";
        } else if (secretWord.includes(char)) {
          if (states[char] !== "correct") {
            states[char] = "present";
          }
        } else {
          if (!states[char]) {
            states[char] = "absent";
          }
        }
      }
    });
    return states;
  }, [guesses, secretWord]);

  // High-performance Wordle-compliant cell state highlighting to handle duplicate letters
  const evaluateGuessRow = (guess: string) => {
    const rowStates: ("correct" | "present" | "absent")[] = Array(WORD_LENGTH).fill("absent");
    const secretLetters = secretWord.split("");

    // Pass 1: Mark exact matches (Green)
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guess[i] === secretWord[i]) {
        rowStates[i] = "correct";
        secretLetters[i] = "_"; // consume letter
      }
    }

    // Pass 2: Mark partial matches (Yellow)
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (rowStates[i] === "correct") continue;
      const char = guess[i];
      const matchIndex = secretLetters.indexOf(char);
      if (matchIndex !== -1) {
        rowStates[i] = "present";
        secretLetters[matchIndex] = "_"; // consume letter
      }
    }

    return rowStates;
  };

  const handleKeyPress = useCallback(
    (key: string) => {
      if (status !== "playing") return;

      if (key === "ENTER") {
        if (currentGuess.length < WORD_LENGTH) return;

        const nextGuesses = [...guesses, currentGuess];
        setGuesses(nextGuesses);
        setCurrentGuess("");

        if (currentGuess === secretWord) {
          stopTimer();
          setStatus("won");
          // Scoring scale: fewer tries = higher score!
          const attemptIndex = nextGuesses.length; // 1-indexed (1 to 6)
          const baseScores = [1500, 1200, 900, 700, 500, 300];
          const calculatedScore = Math.max(
            100,
            (baseScores[attemptIndex - 1] || 100) - seconds * 2
          );
          submit({ score: calculatedScore, combo: 0, mode: "word-guess" });
        } else if (nextGuesses.length >= MAX_TRIES) {
          stopTimer();
          setStatus("lost");
        }
      } else if (key === "BACKSPACE" || key === "⌫") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key)) {
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess((prev) => prev + key);
        }
      }
    },
    [guesses, currentGuess, secretWord, status, seconds, stopTimer, submit]
  );

  // Keyboards listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const k = e.key.toUpperCase();
      if (k === "ENTER") {
        handleKeyPress("ENTER");
      } else if (k === "BACKSPACE") {
        handleKeyPress("BACKSPACE");
      } else if (/^[A-Z]$/.test(k)) {
        handleKeyPress(k);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKeyPress]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const scoreValue = useMemo(() => {
    const attemptIndex = Math.min(6, guesses.length || 1);
    const baseScores = [1500, 1200, 900, 700, 500, 300];
    return Math.max(100, (baseScores[attemptIndex - 1] || 100) - seconds * 2);
  }, [guesses, seconds]);

  // Virtual keyboard layout
  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
  ];

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-4 sm:p-6 max-w-[520px] mx-auto flex flex-col">
        {/* HUD */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <Stat icon="⏱️" label="Time" value={`${mm}:${ss}`} />
          <Stat icon="📝" label="Attempts" value={`${guesses.length}/${MAX_TRIES}`} />
          <button
            onClick={initGame}
            className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-semibold"
          >
            ↻ New Game
          </button>
        </div>

        {/* Word Grid */}
        <div className="space-y-1.5 max-w-[300px] mx-auto w-full mb-6">
          {Array.from({ length: MAX_TRIES }).map((_, rIdx) => {
            const isGuessed = rIdx < guesses.length;
            const isCurrent = rIdx === guesses.length;
            const guessWord = isGuessed ? guesses[rIdx] : isCurrent ? currentGuess : "";

            const rowEvaluations = isGuessed ? evaluateGuessRow(guessWord) : [];

            return (
              <div key={rIdx} className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: WORD_LENGTH }).map((_, cIdx) => {
                  const letter = guessWord[cIdx] || "";
                  const cellState = isGuessed ? rowEvaluations[cIdx] : "empty";

                  let cellStyle: React.CSSProperties = {
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.08)",
                  };

                  if (isGuessed) {
                    if (cellState === "correct") {
                      cellStyle.background = "#10b981"; // Green
                      cellStyle.borderColor = "#059669";
                    } else if (cellState === "present") {
                      cellStyle.background = "#f59e0b"; // Yellow
                      cellStyle.borderColor = "#d97706";
                    } else {
                      cellStyle.background = "rgba(255,255,255,0.1)"; // Dark Slate Gray
                      cellStyle.borderColor = "rgba(255,255,255,0.05)";
                    }
                  } else if (isCurrent && letter) {
                    cellStyle.borderColor = "rgba(139,92,246,0.6)"; // Purple focus outline
                    cellStyle.background = "rgba(255,255,255,0.05)";
                  }

                  return (
                    <div
                      key={cIdx}
                      style={cellStyle}
                      className="aspect-square rounded-lg flex items-center justify-center font-black text-lg sm:text-2xl border transition-all duration-300 select-none text-white uppercase"
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Virtual Keyboard */}
        <div className="space-y-1.5">
          {keyboardRows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1">
              {row.map((key) => {
                const letterState = keyboardLettersState[key];
                let keyStyle: React.CSSProperties = {
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                };

                if (letterState === "correct") {
                  keyStyle.background = "#10b981"; // Green
                } else if (letterState === "present") {
                  keyStyle.background = "#f59e0b"; // Yellow
                } else if (letterState === "absent") {
                  keyStyle.background = "rgba(255,255,255,0.02)"; // Dimmed gray
                  keyStyle.color = "rgba(255,255,255,0.25)";
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    style={keyStyle}
                    className={`h-11 sm:h-12 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center transition-all duration-150 active:scale-90 ${
                      key.length > 1 ? "px-2.5 sm:px-4" : "flex-1"
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Overlays */}
        <div className="relative mt-2">
          <GameOverlay
            show={status === "won"}
            won
            title="Word Solved! 🎉"
            score={scoreValue}
            subtitle={`Attempts: ${guesses.length} · Secret Word: ${secretWord}`}
            saving={submitting}
            saved={saved}
            onRestart={initGame}
          />

          <GameOverlay
            show={status === "lost"}
            title="Out of Guesses! 💀"
            score={0}
            subtitle={`The word was: ${secretWord}`}
            onRestart={initGame}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-1.5 flex flex-col justify-center">
      <div className="text-[10px] text-white/50 leading-none mb-1">
        {icon} {label}
      </div>
      <div className="text-sm font-bold leading-none">{value}</div>
    </div>
  );
}
