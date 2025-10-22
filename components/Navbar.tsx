import React from 'react';
import { Page } from '../types';

interface NavbarProps {
    activePage: Page;
    setPage: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, setPage }) => {
    const navItems: { id: Page; label: string }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'generator', label: 'Generator' },
        { id: 'settings', label: 'Settings' },
    ];

    return (
        <nav className="bg-gray-800/80 backdrop-blur-sm rounded-t-2xl border border-b-0 border-gray-700 overflow-hidden">
            <ul className="flex">
                {navItems.map(item => (
                    <li key={item.id} className="flex-1">
                        <button
                            onClick={() => setPage(item.id)}
                            className={`w-full p-4 text-center font-semibold transition-colors duration-300 ${
                                activePage === item.id
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;
