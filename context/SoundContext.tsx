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

const playSoundEffect = (type: 'getSignal' | 'nextRound' | 'chickenRun') => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        if (type === 'getSignal') {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.2);
        } else if (type === 'nextRound') {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
            gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            osc1.start(ctx.currentTime);
            osc2.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.3);
            osc2.stop(ctx.currentTime + 0.3);
        } else if (type === 'chickenRun') {
            const noise = ctx.createBufferSource();
            const bufferSize = Math.floor(ctx.sampleRate * 0.5);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            noise.buffer = buffer;
            
            const bandpass = ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(800, ctx.currentTime);
            bandpass.Q.setValueAtTime(20, ctx.currentTime);
            
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.5);

            noise.connect(bandpass);
            bandpass.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            noise.loop = true;
            noise.start(ctx.currentTime);
            noise.stop(ctx.currentTime + 2.8);
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
