
import React from 'react';
import type { User } from '../types';
import CloseIcon from './icons/CloseIcon';
import UserIcon from './icons/UserIcon';
import TestIcon from './icons/TestIcon';
import DashboardIcon from './icons/DashboardIcon';
import LanguageIcon from './icons/LanguageIcon';
import { useTranslations } from '../hooks/useTranslations';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onShowTestPage: () => void;
    onShowDashboard: () => void;
    onProfilePictureChange: (url: string) => void;
    onShowLanguageModal: () => void;
    user: User | null;
}

const NavLink: React.FC<{ onClick: () => void; icon: React.ReactNode; text: string }> = ({ onClick, icon, text }) => (
    <a 
        onClick={onClick} 
        className="group relative flex items-center w-full p-3 space-x-4 text-base text-gray-300 rounded-lg hover:bg-white/10 focus:outline-none focus:bg-white/10 transition-colors duration-200 cursor-pointer overflow-hidden"
    >
        <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-accent-cyan to-accent-magenta transform scale-y-0 group-hover:scale-y-100 group-focus:scale-y-100 transition-transform duration-300 origin-center ease-in-out"></span>
        {icon}
        <span>{text}</span>
    </a>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onShowTestPage, onShowDashboard, user, onProfilePictureChange, onShowLanguageModal }) => {
    const { t } = useTranslations();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                onProfilePictureChange(result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div 
            className={`fixed inset-0 z-40 ${isOpen ? '' : 'pointer-events-none'}`}
            aria-hidden={!isOpen}
            role="dialog"
            aria-modal="true"
        >
            {/* Overlay */}
            <div 
                className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>
            
            {/* Close Button on top right of screen */}
             <button 
                onClick={onClose} 
                className={`absolute top-5 right-5 text-gray-400 hover:text-white hover:scale-110 transform transition-all duration-300 ease-out z-50 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                aria-label="Close menu"
            >
                <CloseIcon className="h-8 w-8" />
            </button>

            {/* Panel - Upgraded with a rich gradient background */}
            <div className={`relative flex flex-col w-72 max-w-[calc(100vw-40px)] h-full backdrop-blur-md border-r border-white/10 bg-gradient-to-b from-[#100a28] to-[#3b0734] shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Removed p-6 from parent and added px-4 to children for more control */}
                <div className="flex flex-col h-full">
                    {/* User Info - Reduced margins and icon size for a sleeker look */}
                    <div className="flex items-center p-4 pt-16 space-x-3 border-b border-white/10">
                         <input
                            type="file"
                            id="profile-pic-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={!user}
                        />
                        <label htmlFor="profile-pic-upload" className={`relative p-0.5 rounded-full gradient-border flex-shrink-0 ${user ? 'cursor-pointer' : 'cursor-default'}`}>
                            <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center overflow-hidden">
                                {user?.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="h-8 w-8 text-accent-cyan"/>
                                )}
                            </div>
                        </label>
                        <div className="overflow-hidden">
                            <p className="font-bold text-base text-white font-['Orbitron'] tracking-wide truncate">
                                {user ? `${t('sidebar.player')} ${user.id}` : t('sidebar.welcome')}
                            </p>
                            <p className="text-xs shimmer-text">Mines Predictor Pro</p>
                        </div>
                    </div>

                    {/* Nav Links - Reduced top padding */}
                    <nav className="flex-1 space-y-3 p-4">
                        {user && (
                           <NavLink 
                                onClick={onShowDashboard}
                                icon={<DashboardIcon className="h-6 w-6 text-gray-400 group-hover:text-accent-cyan transition-colors" />}
                                text={t('sidebar.dashboard')}
                           />
                        )}
                        <NavLink 
                            onClick={onShowTestPage}
                            icon={<TestIcon className="h-6 w-6 text-gray-400 group-hover:text-accent-cyan transition-colors" />}
                            text={t('sidebar.testPostback')}
                        />
                        <NavLink 
                            onClick={onShowLanguageModal}
                            icon={<LanguageIcon className="h-6 w-6 text-gray-400 group-hover:text-accent-cyan transition-colors" />}
                            text={t('sidebar.languages')}
                        />
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
