import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import PredictorPage from './components/PredictorPage';
import AccessGuide from './components/AccessGuide';
import SetupGuide from './components/PostbackGuide'; // Renamed logically, but file is PostbackGuide.tsx
import TestPage from './components/TestPage';
import Sidebar from './components/Sidebar';
import PasswordModal from './components/PasswordModal';
import { verificationService } from './services/verificationService';
import type { User } from './types';
import MenuIcon from './components/icons/MenuIcon';
import LogoutIcon from './components/icons/LogoutIcon';
import { LanguageProvider } from './context/LanguageContext';
import { useTranslations } from './hooks/useTranslations';
import LanguageModal from './components/LanguageModal';

// Local storage keys
const ACTIVE_USER_KEY = 'minesPredictorActiveUser';
const USER_DATA_KEY_PREFIX = 'minesPredictorUser:';

const AppContent: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [activeGuide, setActiveGuide] = useState<string | null>(null); // 'access', 'setup', or null
    const [showTestPage, setShowTestPage] = useState<boolean>(false);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
    const { t } = useTranslations();

    
    // State to track login attempts from localStorage
    const [loginAttempts, setLoginAttempts] = useState<Record<string, number>>(() => {
        try {
            const storedAttempts = localStorage.getItem('loginAttempts');
            return storedAttempts ? JSON.parse(storedAttempts) : {};
        } catch (e) {
            console.error("Failed to parse login attempts from localStorage", e);
            return {};
        }
    });

    const loadUserFromStorage = useCallback(async () => {
        const activeUserId = localStorage.getItem(ACTIVE_USER_KEY);
        if (activeUserId) {
            const storedUserJSON = localStorage.getItem(`${USER_DATA_KEY_PREFIX}${activeUserId}`);
            if (storedUserJSON) {
                const parsedUser: User = JSON.parse(storedUserJSON);
                
                if (parsedUser.awaitingDeposit) {
                    const result = await verificationService.verifyRedeposit(parsedUser.id, parsedUser.knownRedeposits);
                    if (result.success && result.newRedepositCount !== undefined) {
                        const updatedUser = { ...parsedUser, predictionCount: 0, awaitingDeposit: false, knownRedeposits: result.newRedepositCount };
                        localStorage.setItem(`${USER_DATA_KEY_PREFIX}${updatedUser.id}`, JSON.stringify(updatedUser));
                        setUser(updatedUser);
                        alert(t('alert.depositSuccess'));
                    } else {
                        setUser(parsedUser);
                    }
                } else {
                    setUser(parsedUser);
                }
            }
        }
        setIsLoading(false);
    }, [t]);

    useEffect(() => {
        loadUserFromStorage();
    }, [loadUserFromStorage]);

    const handleLogin = async (userId: string) => {
        setIsLoading(true);
        setError(null);
        setInfoMessage(null);
        const result = await verificationService.verifyInitialLogin(userId);
        
        if (result.success && result.redepositCount !== undefined) {
            const apiRedepositCount = result.redepositCount;
            const userStorageKey = `${USER_DATA_KEY_PREFIX}${userId}`;
            const storedUserJSON = localStorage.getItem(userStorageKey);
            let userToActivate: User;

            if (storedUserJSON) {
                // User has logged in on this device before.
                const storedUser: User = JSON.parse(storedUserJSON);

                if (apiRedepositCount > storedUser.knownRedeposits) {
                    // Re-deposit detected! Reset prediction count.
                    userToActivate = { 
                        ...storedUser, 
                        predictionCount: 0, 
                        awaitingDeposit: false, 
                        knownRedeposits: apiRedepositCount 
                    };
                    alert(t('alert.newDepositConfirmed'));
                } else {
                    // No new deposit, just logging in again. Preserve prediction count.
                    userToActivate = {
                        ...storedUser,
                        awaitingDeposit: false, // Ensure this is reset on login
                        knownRedeposits: apiRedepositCount // Sync count just in case
                    };
                }
            } else {
                // First time this user is logging in on this device.
                userToActivate = { 
                    id: userId, 
                    predictionCount: 0, 
                    awaitingDeposit: false, 
                    knownRedeposits: apiRedepositCount 
                };
            }

            // Save the user's persistent state
            localStorage.setItem(userStorageKey, JSON.stringify(userToActivate));
            // Set the active user for the session
            localStorage.setItem(ACTIVE_USER_KEY, userId);
            // Update React state
            setUser(userToActivate);

            // On successful login, clear the attempt counter for this user
            const updatedAttempts = { ...loginAttempts };
            if (updatedAttempts[userId]) {
                delete updatedAttempts[userId];
                setLoginAttempts(updatedAttempts);
                localStorage.setItem('loginAttempts', JSON.stringify(updatedAttempts));
            }
        } else {
            // Check for the specific "not found" error from the backend.
            if (result.message && result.message.startsWith("No registration found yet!")) {
                const currentCount = loginAttempts[userId] || 0;
                const newCount = currentCount + 1;
                
                const updatedAttempts = { ...loginAttempts, [userId]: newCount };
                setLoginAttempts(updatedAttempts);
                localStorage.setItem('loginAttempts', JSON.stringify(updatedAttempts));

                if (newCount < 3) {
                    setError("error.notRegistered");
                } else {
                    setError("error.notFoundYet");
                }
            } else if (result.message && result.message.includes('successfully completed registration')) {
                setInfoMessage(result.message);
            } else {
                setError(result.message || "Login failed.");
            }
        }
        setIsLoading(false);
    };

    const handleLogout = () => {
        // Only remove the active session key, not the user's data
        localStorage.removeItem(ACTIVE_USER_KEY);
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        // Save the updated user data to their specific storage key
        localStorage.setItem(`${USER_DATA_KEY_PREFIX}${updatedUser.id}`, JSON.stringify(updatedUser));
    };

    const handleProfilePictureChange = (url: string) => {
        if (user) {
            const updatedUser = { ...user, profilePictureUrl: url };
            updateUser(updatedUser);
        }
    };

    const handleShowAccessGuide = () => {
        setShowTestPage(false);
        setActiveGuide('access');
        setIsMenuOpen(false);
    };
    
    const handleShowSetupGuide = () => {
        setShowTestPage(false);
        setActiveGuide('setup');
        setIsMenuOpen(false);
    }

    const handleHideGuide = () => {
        setActiveGuide(null);
        setIsMenuOpen(false);
    };

    const handleShowTestPage = () => {
        setIsMenuOpen(false);
        setIsPasswordModalOpen(true);
    };
    
    const handlePasswordSuccess = () => {
        setIsPasswordModalOpen(false);
        setActiveGuide(null);
        setShowTestPage(true);
    };

    const handleShowDashboard = () => {
        setActiveGuide(null);
        setShowTestPage(false);
        setIsMenuOpen(false);
    };

    const handleShowLanguageModal = () => {
        setIsMenuOpen(false);
        setIsLanguageModalOpen(true);
    }
    
    if (isLoading && !user) { // Only show full-screen loader on initial load
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }
    
    const isGuideVisible = activeGuide !== null;
    const isPredictorPageActive = user && !isGuideVisible && !showTestPage;

    const renderContent = () => {
        if (showTestPage) return <TestPage onShowSetupGuide={handleShowSetupGuide} />;
        if (activeGuide === 'access') return <AccessGuide />;
        if (activeGuide === 'setup') return <SetupGuide />;
        if (!user) return <LoginPage onLogin={handleLogin} error={error} isLoading={isLoading} infoMessage={infoMessage} />;
        
        return (
            <>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold shimmer-text text-center mb-8 font-['Orbitron']" style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.4)'}}>
                    Mines Predictor Pro
                </h2>
                <PredictorPage user={user} onUpdateUser={updateUser} />
            </>
        );
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <PasswordModal 
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSuccess={handlePasswordSuccess}
            />
            <LanguageModal
                isOpen={isLanguageModalOpen}
                onClose={() => setIsLanguageModalOpen(false)}
            />
            <Sidebar
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onShowTestPage={handleShowTestPage}
                onShowDashboard={handleShowDashboard}
                onProfilePictureChange={handleProfilePictureChange}
                onShowLanguageModal={handleShowLanguageModal}
                user={user}
            />
            {/* Header updated to use CSS Grid for better responsiveness on mobile */}
            <header className="grid grid-cols-[auto_1fr_auto] items-center gap-4 mb-10 p-4 rounded-xl bg-[#161a27] z-10">
                {/* Left: Menu Button */}
                <div>
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                        aria-label="Open menu"
                    >
                        <MenuIcon className="h-6 w-6 text-white"/>
                    </button>
                </div>
                
                {/* Center: Title */}
                <h1 
                    onClick={handleShowDashboard}
                    className={`text-center text-xl sm:text-3xl font-bold shimmer-text transition-opacity duration-300 truncate ${isPredictorPageActive ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-pointer hover:opacity-80'}`}
                >
                    Mines Pre...
                </h1>

                {/* Right: Logout / Guide Button */}
                <div className="flex items-center justify-end">
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="btn btn-dark p-3"
                            aria-label="Logout"
                        >
                            <LogoutIcon className="h-6 w-6" />
                        </button>
                    ) : (
                         isGuideVisible ? (
                            <button
                                onClick={handleHideGuide}
                                className="btn btn-dark text-sm"
                            >
                                {t('header.hide')}
                            </button>
                         ) : (
                            <button
                                onClick={handleShowAccessGuide}
                                className="btn btn-guide text-sm"
                            >
                                {t('header.guide')}
                            </button>
                         )
                    )}
                </div>
            </header>

            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
};


const App: React.FC = () => (
    <LanguageProvider>
        <AppContent />
    </LanguageProvider>
);


export default App;
