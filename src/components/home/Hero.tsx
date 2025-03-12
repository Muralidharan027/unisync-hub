
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = heroRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center px-6 py-24 md:px-12"
      ref={heroRef}
    >
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Tag line */}
          <div className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-unisync-blue dark:text-blue-300 text-sm font-medium mb-6">
              Revolutionizing Campus Communication
            </span>
          </div>
          
          {/* Main headline */}
          <h1 className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-100 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="block">Streamlined Communication</span>
            <span className="block mt-2 text-gradient">For Educational Institutions</span>
          </h1>

          {/* Sub headline */}
          <p className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mt-6">
            Replace chaotic group chats with an organized platform for announcements, leave requests, and notifications.
          </p>

          {/* CTA buttons */}
          <div className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-300 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-10">
            <Link 
              to="/register" 
              className="smooth-transition px-8 py-4 rounded-full bg-unisync-blue text-white hover:shadow-lg hover:bg-blue-600 transform hover:-translate-y-0.5 text-lg font-medium"
            >
              Get Started
            </Link>
            <a 
              href="#features"
              className="smooth-transition px-8 py-4 rounded-full border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-lg font-medium"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
          <a 
            href="#features" 
            className="smooth-transition p-2 rounded-full text-gray-500 hover:text-unisync-blue"
            aria-label="Scroll down"
          >
            <ChevronDown size={24} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
