'use client';

import React from 'react';
import { Frown, Smile, Meh } from 'lucide-react';

const MoodIcon = ({ mood, variant = 'default' }) => {
    const containerClass = variant === 'card'
        ? 'p-2 rounded-xl shadow-md'
        : 'p-2 rounded-lg';

    if (mood === 'good') {
        return (
            <div className={`${containerClass} bg-green-500`}>
                <Smile className="w-5 h-5 text-white" />
            </div>
        );
    } else if (mood === 'warning') {
        return (
            <div className={`${containerClass} bg-orange-500`}>
                <Meh className="w-5 h-5 text-white" />
            </div>
        );
    }
    return (
        <div className={`${containerClass} bg-red-500`}>
            <Frown className="w-5 h-5 text-white" />
        </div>
    );
};

export default MoodIcon;
