
import React, { useEffect, useRef } from 'react';
import { BellRing, MessageSquare, Clock, CheckCircle, Users, Shield } from 'lucide-react';

const features = [
  {
    icon: BellRing,
    title: 'Smart Notifications',
    description: 'Categorized announcements with push notifications for important updates.'
  },
  {
    icon: MessageSquare,
    title: 'Streamlined Communication',
    description: 'Centralized platform replacing disorganized WhatsApp and Telegram groups.'
  },
  {
    icon: Clock,
    title: 'Request Management',
    description: 'Efficient leave and OD request submissions with automatic tracking.'
  },
  {
    icon: CheckCircle,
    title: 'Approval Workflow',
    description: 'Transparent approval process with real-time status updates.'
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Tailored interfaces for students, staff, and administrators.'
  },
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'Role-based authentication with additional security for staff and admins.'
  }
];

const Features = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const elements = featuresRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section id="features" className="py-20 px-6 md:px-12 bg-gray-50 dark:bg-gray-900" ref={featuresRef}>
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="animate-on-scroll inline-block px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-unisync-blue dark:text-blue-300 text-sm font-medium mb-6">
            Features
          </span>
          <h2 className="animate-on-scroll text-3xl md:text-4xl font-bold mb-6">
            Everything You Need in One Place
          </h2>
          <p className="animate-on-scroll text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            UniSync provides a complete solution for educational institution communication and management needs.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="animate-on-scroll glass-card rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-unisync-blue dark:text-blue-300 mb-6">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
