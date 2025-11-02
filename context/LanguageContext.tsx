import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations } from '../i18n/translations';

type LanguageContextType = {
    language: string;
    setLanguage: (language: string) => void;
    t: (key: string) => string;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<string>(() => {
        try {
            const storedLang = localStorage.getItem('mines-predictor-lang');
            return storedLang || 'en';
        } catch (e) {
            console.error("Could not access localStorage", e);
            return 'en';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('mines-predictor-lang', language);
        } catch (e) {
            console.error("Could not access localStorage", e);
        }
    }, [language]);

    const t = useCallback((key: string): string => {
        const keys = key.split('.');
        let result: any = translations;
        try {
            for (const k of keys) {
                if (result === undefined) break;
                result = result[k];
            }
            const translatedString = result?.[language] || result?.['en'];
            
            // If translation is not found for the key, return the key itself
            if (translatedString === undefined) {
                 // Check if the key exists at all in the english translation
                let fallbackResult: any = translations;
                for (const k of keys) {
                    if(fallbackResult === undefined) break;
                    fallbackResult = fallbackResult[k];
                }
                if(fallbackResult?.['en']) return key; // It's a valid key but missing translation for current lang
                
                // The key might BE the message (e.g. from API)
                return key;
            }

            return translatedString;

        } catch (e) {
            console.error(`Translation error for key: ${key}`, e);
            return key; // Fallback to the key itself on error
        }
    }, [language]);


    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
