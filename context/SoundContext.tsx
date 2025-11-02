import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

type SoundContextType = {
    isMuted: boolean;
    toggleMute: () => void;
    playSound: (sound: 'getSignal' | 'nextRound' | 'chickenRun') => void;
};

export const SoundContext = createContext<SoundContextType | undefined>(undefined);

let audioContext: AudioContext | null = null;
const getAudioContext = () => {
    if (typeof window !== 'undefined' && !audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// --- Professional Sound Effects ---
const playSoundEffect = (type: 'getSignal' | 'nextRound' | 'chickenRun') => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;

        if (type === 'getSignal') {
            // A sharp, digital "pew" sound for UI interaction
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01); // Quick attack
            
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.15); // Pitch drop
            
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2); // Fast decay

            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'nextRound') {
            // A pleasant, ascending C-major arpeggio for a positive confirmation
            const notes = [392, 523, 659]; // G4, C5, E5
            
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();
                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                const startTime = now + i * 0.08;
                
                osc.type = 'triangle'; // Softer, "game-like" tone
                osc.frequency.setValueAtTime(freq, startTime);
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.2);

                osc.start(startTime);
                osc.stop(startTime + 0.2);
            });
        } else if (type === 'chickenRun') {
            // A dynamic "whoosh" sound to match the animation
            const duration = 2.8;

            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1; // White noise
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.Q.value = 5;
            filter.frequency.setValueAtTime(2000, now); // Start high
            filter.frequency.exponentialRampToValueAtTime(100, now + duration * 0.8); // Sweep low

            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.15, now + 0.2); // Fade in
            gainNode.gain.linearRampToValueAtTime(0.15, now + duration - 0.5); // Hold
            gainNode.gain.linearRampToValueAtTime(0, now + duration); // Fade out
            
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            noise.start(now);
            noise.stop(now + duration);
        }

    } catch (e) {
        console.error("Failed to play sound", e);
    }
};

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        try {
            const storedMute = localStorage.getItem('mines-predictor-sound-muted');
            return storedMute ? JSON.parse(storedMute) : false;
        } catch (e) {
            console.error("Could not access localStorage for sound settings", e);
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('mines-predictor-sound-muted', JSON.stringify(isMuted));
        } catch (e) {
            console.error("Could not access localStorage for sound settings", e);
        }
    }, [isMuted]);

    const toggleMute = () => {
        // Resume audio context on user interaction
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
        setIsMuted(prev => !prev);
    };

    const playSound = useCallback((sound: 'getSignal' | 'nextRound' | 'chickenRun') => {
        if (isMuted) return;
        playSoundEffect(sound);
    }, [isMuted]);

    return (
        <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
            {children}
        </SoundContext.Provider>
    );
};