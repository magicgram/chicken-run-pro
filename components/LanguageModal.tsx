import React, { useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { languages } from '../i18n/translations';

interface LanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
    const { t, setLanguage, language } = useTranslations();
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside the modal content to close it
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };
    
    const handleLanguageSelect = (langCode: string) => {
        setLanguage(langCode);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleOverlayClick}
            aria-labelledby="language-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div 
                ref={modalRef}
                className="w-full max-w-sm p-6 space-y-6 glassmorphic-card rounded-2xl shadow-2xl main-content"
            >
                <div className="text-center">
                    <h2 id="language-modal-title" className="text-2xl font-bold text-white font-['Orbitron']">
                        {t('languageModal.title')}
                    </h2>
                </div>

                <div className="space-y-3">
                    {Object.entries(languages).map(([code, { name, flag }]) => (
                        <button
                            key={code}
                            onClick={() => handleLanguageSelect(code)}
                            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-left font-semibold text-lg ${
                                language === code
                                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                                : 'bg-black/30 hover:bg-white/10 text-gray-200'
                            }`}
                        >
                            <span className="mr-4 text-2xl">{flag}</span>
                            <span>{name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LanguageModal;
