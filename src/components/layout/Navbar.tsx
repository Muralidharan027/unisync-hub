
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 md:px-12",
        isScrolled 
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2"
        >
          <span className="text-2xl font-bold text-gradient">UniSync</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How It Works</NavLink>
          <NavLink href="#about">About</NavLink>
          <NavLink href="#contact">Contact</NavLink>
          <Link 
            to="/login" 
            className="smooth-transition px-6 py-2 rounded-full bg-unisync-blue text-white hover:shadow-lg hover:bg-blue-600 transform hover:-translate-y-0.5"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMobileMenu} 
          className="md:hidden focus:outline-none"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-40 bg-white dark:bg-gray-900 md:hidden">
          <div className="flex flex-col items-center justify-center h-full space-y-8 text-lg">
            <MobileNavLink href="#features" onClick={toggleMobileMenu}>Features</MobileNavLink>
            <MobileNavLink href="#how-it-works" onClick={toggleMobileMenu}>How It Works</MobileNavLink>
            <MobileNavLink href="#about" onClick={toggleMobileMenu}>About</MobileNavLink>
            <MobileNavLink href="#contact" onClick={toggleMobileMenu}>Contact</MobileNavLink>
            <Link 
              to="/login" 
              className="smooth-transition px-8 py-3 rounded-full bg-unisync-blue text-white"
              onClick={toggleMobileMenu}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a 
    href={href} 
    className="text-gray-700 dark:text-gray-200 hover:text-unisync-blue dark:hover:text-unisync-blue smooth-transition font-medium"
  >
    {children}
  </a>
);

const MobileNavLink = ({ 
  href, 
  onClick, 
  children 
}: { 
  href: string; 
  onClick: () => void; 
  children: React.ReactNode 
}) => (
  <a 
    href={href} 
    className="text-gray-800 dark:text-gray-100 text-xl font-medium"
    onClick={onClick}
  >
    {children}
  </a>
);

export default Navbar;
