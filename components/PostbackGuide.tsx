

import React, { useState, useEffect } from 'react';
import CopyIcon from './icons/CopyIcon';
import { useTranslations } from '../hooks/useTranslations';

const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 mr-2 bg-gradient-to-br from-accent-cyan to-accent-magenta text-black rounded-full font-bold text-lg">
            {number}
        </div>
        <div className="flex-grow">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-text-secondary mt-1">{children}</p>
        </div>
    </div>
);

const URLBlock: React.FC = () => {
    const [postbackUrl, setPostbackUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const { t } = useTranslations();

    useEffect(() => {
        // This ensures the code only runs on the client-side where window is available.
        setPostbackUrl(`${window.location.origin}/api/postback`);
    }, []);

    const handleCopy = () => {
        if (!postbackUrl) return;
        navigator.clipboard.writeText(postbackUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="flex items-start space-x-4">
             <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 mr-2 bg-gradient-to-br from-accent-cyan to-accent-magenta text-black rounded-full font-bold text-lg">
                1
            </div>
            <div className="flex-grow">
                 <h3 className="text-lg font-semibold text-white">{t('postbackGuide.urlTitle')}</h3>
                <div className="mt-2 flex items-center justify-between bg-black/40 p-2 pr-3 rounded-lg border border-white/20">
                    <span className="font-mono text-sm text-yellow-300 break-all">{postbackUrl || t('postbackGuide.loadingUrl')}</span>
                    <button 
                        onClick={handleCopy}
                        className="p-2 ml-2 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan flex-shrink-0"
                        aria-label="Copy URL"
                        disabled={!postbackUrl}
                    >
                        {copied ? (
                           <span className="text-green-400 text-xs font-semibold">{t('common.copied')}</span>
                        ) : (
                           <CopyIcon className="h-5 w-5 text-gray-400" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SetupGuide: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="w-full max-w-2xl mx-auto p-8 glassmorphic-card gradient-border rounded-2xl shadow-2xl mb-8">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold shimmer-text mb-2">
                    {t('postbackGuide.title')}
                </h2>
                <p className="text-text-secondary">{t('postbackGuide.subtitle')}</p>
            </div>
            
            <div className="space-y-6">
                <URLBlock />
                <Step number={2} title={t('postbackGuide.step2Title')}>
                    {t('postbackGuide.step2Desc')}
                </Step>
                <Step number={3} title={t('postbackGuide.step3Title')}>
                    {t('postbackGuide.step3Desc')}
                </Step>
                <Step number={4} title={t('postbackGuide.step4Title')}>
                   {t('postbackGuide.step4Desc')}
                </Step>
                <Step number={5} title={t('postbackGuide.step5Title')}>
                    {t('postbackGuide.step5Desc')}
                </Step>
            </div>
        </div>
    );
};

export default SetupGuide;
