
import React from 'react';

type AnimatedBackgroundProps = {
  children: React.ReactNode;
  className?: string;
};

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 z-0" />
      
      {/* Animated shapes */}
      <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-blue-100/40 dark:bg-blue-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" />
        <div className="absolute top-[40%] right-[10%] w-72 h-72 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float animation-delay-2000" />
        <div className="absolute bottom-[10%] left-[20%] w-80 h-80 bg-purple-100/30 dark:bg-purple-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float animation-delay-4000" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AnimatedBackground;
