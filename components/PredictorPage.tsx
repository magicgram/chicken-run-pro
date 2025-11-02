import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { useSound } from '../hooks/useSound';
import { verificationService } from '../services/verificationService';

// --- Constants ---
const PREDICTION_LIMIT = 15;
// @ts-ignore - VITE_AFFILIATE_LINK is injected by the build process
const AFFILIATE_LINK = import.meta.env.VITE_AFFILIATE_LINK || 'https://1waff.com/?p=YOUR_CODE_HERE';

// --- Prediction Values ---
const COMMON_MULTIPLIERS = ["1.20x", "1.44x", "1.72x", "2.06x", "2.47x"];
const RARE_MULTIPLIERS = ["2.96x", "3.55x", "4.26x", "5.11x"];
const RARE_CHANCE = 1 / 15; // Approx 1 in 15 will be rare


// --- Component Props Interface ---
interface PredictorPageProps {
    user: User;
    onUpdateUser: (user: User) => void;
}

// --- Component ---
const PredictorPage: React.FC<PredictorPageProps> = ({ user, onUpdateUser }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [prediction, setPrediction] = useState<{ value: string; accuracy: number } | null>(null);
    const [showResult, setShowResult] = useState(false);

    const chickenRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslations();
    const { playSound } = useSound();

    const predictionsUsed = user.predictionCount;
    const predictionsLeft = PREDICTION_LIMIT - predictionsUsed;

    useEffect(() => {
        // Add class to body for special full-screen styling
        document.body.classList.add('game-mode');
        // Cleanup on component unmount
        return () => {
            document.body.classList.remove('game-mode');
        };
    }, []);

    const handleGetSignal = () => {
        if (predictionsLeft <= 0 || user.awaitingDeposit || isGenerating || showResult) {
            if(!isGenerating && !showResult) onUpdateUser({ ...user, awaitingDeposit: true });
            return;
        }
        
        playSound('getSignal');
        setIsGenerating(true);

        // Trigger animation
        if (chickenRef.current) {
            chickenRef.current.classList.add('running');
            playSound('chickenRun');
        }

        setTimeout(() => {
            // Generate prediction
            const isRare = Math.random() < RARE_CHANCE;
            const multipliers = isRare ? RARE_MULTIPLIERS : COMMON_MULTIPLIERS;
            const value = multipliers[Math.floor(Math.random() * multipliers.length)];
            
            // Generate a random accuracy between 70% and 99%
            const minAccuracy = 70;
            const maxAccuracy = 99;
            const accuracy = Math.floor(Math.random() * (maxAccuracy - minAccuracy + 1)) + minAccuracy;

            setPrediction({ value, accuracy });
            onUpdateUser({ ...user, predictionCount: user.predictionCount + 1 });
            
            setIsGenerating(false);
            setShowResult(true);
            
            if (chickenRef.current) {
                chickenRef.current.classList.remove('running');
            }
        }, 3000); // 3-second animation
    };

    const handleNextRound = () => {
        playSound('nextRound');
        setShowResult(false);
        setPrediction(null);
    };

    const handleDeposit = () => {
        window.open(AFFILIATE_LINK, '_blank');
    };

    if (user.awaitingDeposit || predictionsLeft <= 0) {
        const depositInfo = t('predictor.depositInfo').replace('{limit}', PREDICTION_LIMIT.toString());
        return (
            <div className="flex items-center justify-center h-screen bg-gray-800 p-4">
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
            </div>
        );
    }
    
    return (
        <div className="game-container">
            <div className="clouds"></div>
            <main className="game-world">
                <div className="road-signs">
                    <div className="sign yellow-sign">
                        <div className="sign-face"><span>Start</span></div>
                    </div>
                    <div className="sign grey-sign">
                        <div className="sign-face"><span>1.20x</span></div>
                    </div>
                    <div className="sign grey-sign">
                        <div className="sign-face"><span>1.44x</span></div>
                    </div>
                     <div className="sign grey-sign">
                        <div className="sign-face"><span>...</span></div>
                    </div>
                </div>
                <div className="wall"></div>
                <div className="road">
                    <div className="manhole"></div>
                    <div className="manhole"></div>
                </div>
                <div ref={chickenRef} className="chicken"></div>
            </main>

            <footer className="game-footer">
                {!showResult && (
                    <>
                        <div className="prediction-placeholder">?</div>
                        <button 
                            className="action-button"
                            onClick={handleGetSignal}
                            disabled={isGenerating}
                        >
                            {isGenerating ? t('predictor.generating') : t('predictor.getSignal')}
                        </button>
                    </>
                )}
            </footer>
            
            {showResult && prediction && (
                <div className="result-overlay">
                    <div className="result-modal">
                        <div className="result-coin">
                            <span>{prediction.value}</span>
                        </div>
                        <div className="result-info">
                            {t('predictor.accuracyLabel').replace('{accuracy}', prediction.accuracy.toString())}
                            <br />
                            {t('predictor.cashoutLabel').replace('{value}', prediction.value)}
                        </div>
                         <button 
                            className="action-button"
                            onClick={handleNextRound}
                        >
                            {t('predictor.nextRound')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictorPage;