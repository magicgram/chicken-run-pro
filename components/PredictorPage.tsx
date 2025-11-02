

import React, { useState, useEffect, useRef } from 'react';
import type { User, GridCellState } from '../types';
import MineGrid from './MineGrid';
import { useTranslations } from '../hooks/useTranslations';

// --- Constants ---
const GRID_SIZE = 25;
const PREDICTION_LIMIT = 15;
// @ts-ignore - VITE_AFFILIATE_LINK is injected by the build process
const AFFILIATE_LINK = import.meta.env.VITE_AFFILIATE_LINK || 'https://1waff.com/?p=YOUR_CODE_HERE';

// --- Sound Effects (Base64 Encoded) ---
const REVEAL_SOUND_B64 = 'data:audio/mpeg;base64,SUQzBAAAAAAAIlgAnXYAALUDAAABNVEzAwgAAAAAAVBUTUxkAAAAAAA5VUREVAAAAAEAABpNU0lEAAAAAABzYW1wbGVfcmF0ZQAAAAAAADI0MDAwAAAAAG51bV9jaGFubmVscwAAAAAAAAABAAAAbGVuZ3RoAAAAAAAAADYxNDRAACAP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAAAAAABJbmZvAAAADwAAAAMAAIK7AQUICKMAPAAAAAAA/+NIgAAB9AAABQAAASwAASwwAASwQASTAASTQASUAASYAASVACUoJTQlNCSsJTglicEl4SWhJcElpCW4JcAl0CXgJegl8CX4JgAmECYgJjQmZCaAJoQmiCaYJpgmtCa4JsQm1CboJvAm/CcwJzwnQCdwJ5AnwCfoKAQqECooKjgqSCpIKlgqaCqoKsgq2CsIKxgrGCsoKzgrUCtYK2AreCvILAgAAAAAAAAAAAAAENDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ...';
const NEXT_SOUND_B64 = 'data:audio/mpeg;base64,SUQzBAAAAAAAIhgAlgALAAAAAAAQTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//+xgYMd/G//5w+A3/9/hAEAAABMYXZmNTguMjkuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVw4NDBQQDBAUEBPABAAEERkZG7/6/////+xgYMd/G//5w+A3/9/hAEAAABMYXZmNTguMjkuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVw4-NDBQQDBAUEBPABAAEERkZG/7/6/////+xgYMd/G//5w+A3/9/hAEAAABMYXZmNTguMjkuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-&size=512&duration=1.44&root_url=https%3A%2F%2Faistudio.google.com%2Fprototypes&version=1';

// --- Prediction Patterns ('S' = Star/Safe, 'B' = Bomb/Trap) ---
const ONE_TRAP_PATTERNS_RAW = [
  "BSSSS SSSSS SSSSS SSSSS SSSSS",
  "SSSSS SBSSS SSSSS SSSSS SSSSS",
  "SSSSS SSSSS SBSSS SSSSS SSSSS",
  "SSSSS SSSSS SSSSS SBSSS SSSSS",
  "SSSSS SSSSS SSSSS SSSSS SBSSS"
];

const THREE_TRAP_PATTERNS_RAW = [
  "BSSSS SSSBS SSSBS SSSSS SSSSS",
  "SSSSS SBSBS SSSSS SBSBS SSSSS",
  "BSBSS SSSSS SSBSS SSSSS BSSSS",
  "SSBSS BSSSB SSSSS SSSSS SSSSS"
];

const FIVE_TRAP_PATTERNS_RAW = [
  "BSBSB SSSSS SBSBS SSSSS SSSSS",
  "BSSBS SSSSS SBBSS SSSSS SBSSS",
  "BSSSB SSSSS BSSSB SSSSS BSSSB",
  "BSBSS SBBSS SSSSS SSSSS BSSSS"
];

const PATTERNS: Record<number, string[]> = {
    1: ONE_TRAP_PATTERNS_RAW,
    3: THREE_TRAP_PATTERNS_RAW,
    5: FIVE_TRAP_PATTERNS_RAW,
};

// --- Helper Function to Parse Patterns ---
const parsePattern = (rawPattern: string): GridCellState[] => {
    const cleanPattern = rawPattern.replace(/\s/g, '');
    const chars = Array.from(cleanPattern);
    const parsed = chars.map(char => (char === 'S' ? 'star' : 'bomb'));
    
    const finalPattern = parsed.slice(0, GRID_SIZE);
    while (finalPattern.length < GRID_SIZE) {
        finalPattern.push('star');
    }
    return finalPattern;
};


// --- Component Props Interface ---
interface PredictorPageProps {
    user: User;
    onUpdateUser: (user: User) => void;
}

// --- Component ---
const PredictorPage: React.FC<PredictorPageProps> = ({ user, onUpdateUser }) => {
    const [gridState, setGridState] = useState<GridCellState[]>(() => Array(GRID_SIZE).fill('hidden'));
    const [fullPattern, setFullPattern] = useState<GridCellState[]>([]);
    const [isRevealing, setIsRevealing] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const [traps, setTraps] = useState<1 | 3 | 5>(3);
    const [accuracy, setAccuracy] = useState<number>(0); // State for random accuracy

    const revealSound = useRef<HTMLAudioElement | null>(null);
    const nextSound = useRef<HTMLAudioElement | null>(null);
    const { t } = useTranslations();

    const predictionsUsed = user.predictionCount;
    const predictionsLeft = PREDICTION_LIMIT - predictionsUsed;

    useEffect(() => {
        revealSound.current = new Audio(REVEAL_SOUND_B64);
        nextSound.current = new Audio(NEXT_SOUND_B64);
        revealSound.current.load();
        nextSound.current.load();
    }, []);

    const playSound = (soundRef: React.RefObject<HTMLAudioElement>) => {
        if (soundRef.current) {
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(e => console.error("Error playing sound:", e));
        }
    };

    const handleReveal = () => {
        if (predictionsLeft <= 0 || user.awaitingDeposit) {
            onUpdateUser({ ...user, awaitingDeposit: true });
            return;
        }

        setIsRevealing(true);
        setIsRevealed(false);
        setGridState(Array(GRID_SIZE).fill('hidden'));

        setTimeout(() => {
            const patternSet = PATTERNS[traps];
            const randomIndex = Math.floor(Math.random() * patternSet.length);
            const newFullPattern = parsePattern(patternSet[randomIndex]);
            setFullPattern(newFullPattern);

            const initialGrid: GridCellState[] = newFullPattern.map(cell =>
                cell === 'star' ? 'star' : 'hidden'
            );
            
            // Generate and set random accuracy between 70% and 99%
            const randomAccuracy = Math.floor(Math.random() * 30) + 70;
            setAccuracy(randomAccuracy);

            setGridState(initialGrid);
            playSound(revealSound);

            onUpdateUser({ ...user, predictionCount: user.predictionCount + 1 });
            setIsRevealing(false);
            setIsRevealed(true);
        }, 1200);
    };

    const handleNext = () => {
        playSound(nextSound);
        setGridState(fullPattern); // Show bombs
        setTimeout(() => {
            setIsRevealed(false); // Button will become "Reveal" again
            setGridState(Array(GRID_SIZE).fill('hidden')); // Reset grid for next round
        }, 1500); // Show bombs for 1.5 seconds before resetting
    };

    const handleDeposit = () => {
        window.open(AFFILIATE_LINK, '_blank');
    };

    if (user.awaitingDeposit || predictionsLeft <= 0) {
        const depositInfo = t('predictor.depositInfo').replace('{limit}', PREDICTION_LIMIT.toString());
        return (
            <div className="text-center p-8 glassmorphic-card rounded-2xl shadow-2xl max-w-lg mx-auto">
                <h3 className="text-2xl font-bold text-white mb-3 font-['Orbitron']">{t('predictor.limitTitle')}</h3>
                <p className="text-text-secondary mb-6">{t('predictor.limitSubtitle')}</p>
                <div className="bg-blue-900/40 border border-white/10 rounded-lg p-4 mb-6">
                    <p className="font-semibold text-white">{t('predictor.whyDeposit')}</p>
                    <p className="text-sm text-gray-300 mt-1">{depositInfo}</p>
                </div>
                <button
                    onClick={handleDeposit}
                    className="w-full btn btn-dark"
                >
                    {t('predictor.depositNow')}
                </button>
                <p className="text-xs text-gray-400 mt-4">{t('predictor.depositNote')}</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col items-center glassmorphic-card rounded-2xl p-4 sm:p-6 space-y-6">
            {/* Welcome Message */}
            <div className="w-full text-center">
                <h2 className="text-xl text-white">{t('predictor.welcome')} <span className="font-bold text-pink-300">{user.id}</span></h2>
            </div>

            {/* Progress Bar */}
            <div className="w-full">
                <div className="flex justify-between items-center text-text-secondary text-sm mb-2">
                    <span>{t('predictor.predictionsUsed')}</span>
                    <span className="font-bold text-white">{predictionsUsed} / {PREDICTION_LIMIT}</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden border border-white/10 shadow-inner">
                    <div 
                        className="bg-gradient-to-r from-pink-500 to-fuchsia-500 h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${(predictionsUsed / PREDICTION_LIMIT) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Trap Selection */}
            <div className="w-full">
                <h3 className="text-center font-bold text-lg text-white mb-3">{t('predictor.selectTraps')}</h3>
                <div className="flex justify-center bg-black/40 p-1 rounded-xl">
                    {([1, 3, 5] as const).map(num => (
                        <button
                            key={num}
                            onClick={() => {
                                if (!isRevealing && !isRevealed) setTraps(num);
                            }}
                            disabled={isRevealing || isRevealed}
                            className={`flex-1 mx-0.5 py-2 px-4 rounded-lg font-semibold transition-colors duration-300 text-sm sm:text-base ${
                                traps === num 
                                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md' 
                                : 'bg-transparent text-gray-300 hover:bg-white/10 disabled:opacity-50'
                            }`}
                        >
                            {num} {t('predictor.traps')}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Accuracy Warning */}
            {isRevealed && !isRevealing && (
                <div className="w-full text-center p-3 rounded-lg bg-purple-900/40 border border-yellow-500/60 main-content">
                    <p className="font-bold text-lg text-yellow-300">{t('predictor.accuracy')}: {accuracy}%</p>
                    <p className="text-sm text-yellow-400">{t('predictor.warning')}</p>
                </div>
            )}

            {/* Mine Grid */}
            <MineGrid gridState={gridState} />

            {/* Action Buttons */}
            <div className="w-full pt-2 space-y-3">
                 <button
                    onClick={handleReveal}
                    disabled={isRevealing || isRevealed}
                    className="w-full btn btn-dark text-lg"
                >
                    {isRevealing ? (
                        <div className="flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-white mr-3"></div>
                            <span>{t('predictor.revealing')}</span>
                        </div>
                    ) : (
                        t('predictor.reveal')
                    )}
                </button>
                 <button
                    onClick={handleNext}
                    disabled={!isRevealed || isRevealing}
                    className="w-full btn btn-dark text-lg"
                >
                    {t('predictor.next')}
                </button>
            </div>
        </div>
    );
};

export default PredictorPage;
