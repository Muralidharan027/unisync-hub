
import React, { useEffect } from 'react';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import CTASection from '@/components/home/CTASection';
import Footer from '@/components/layout/Footer';

const Index = () => {
  // Initialize scroll animation handler
  useEffect(() => {
    const handleScrollAnimation = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('in-view');
        }
      });
    };
    
    // Run on initial load
    handleScrollAnimation();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScrollAnimation);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScrollAnimation);
    };
  }, []);
  
  return (
    <div className="min-h-screen">
      <AnimatedBackground className="min-h-screen">
        <Navbar />
        <Hero />
      </AnimatedBackground>
      
      <Features />
      
      <CTASection />
      
      <Footer />
    </div>
  );
};

export default Index;
