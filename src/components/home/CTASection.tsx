
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl overflow-hidden neo-blur">
          <div className="px-8 py-16 md:p-16 relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-unisync-blue rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-subtle"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-unisync-indigo rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-subtle animation-delay-2000"></div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
              <div className="mb-10 md:mb-0 md:mr-10 max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  Ready to Transform Your Campus Communications?
                </h2>
                <p className="text-lg text-gray-200 mb-8">
                  Join educational institutions that have already streamlined their communication processes with UniSync. Get started today.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/register" 
                    className="smooth-transition px-8 py-4 rounded-full bg-white text-unisync-blue hover:shadow-lg hover:bg-gray-100 transform hover:-translate-y-0.5 text-lg font-medium flex items-center"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link 
                    to="/contact" 
                    className="smooth-transition px-8 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 text-lg font-medium"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-auto flex-shrink-0">
                <div className="rounded-2xl bg-white/10 border border-white/20 p-6 backdrop-blur-sm max-w-sm">
                  <h3 className="text-xl font-semibold text-white mb-4">Join the Beta Program</h3>
                  <p className="text-gray-200 mb-6">
                    Be among the first to experience UniSync and help shape its future.
                  </p>
                  <form className="space-y-4">
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-unisync-blue/50"
                    />
                    <button 
                      type="submit" 
                      className="w-full smooth-transition px-4 py-3 rounded-lg bg-unisync-blue text-white hover:bg-blue-600"
                    >
                      Join Now
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
