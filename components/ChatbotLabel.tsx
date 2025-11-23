'use client';

import { useEffect, useState } from 'react';

export const ChatbotLabel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true after component mounts (client-side only)
    setIsMounted(true);

    // Check if user has already clicked the chatbot
    const hasClickedChatbot = localStorage.getItem('chatbot-clicked');

    if (!hasClickedChatbot) {
      setIsVisible(true);
    }

    // Listen for clicks on the chatbot button
    const handleChatbotClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if click is on chatbot button or its children
      if (
        target.closest('[id*="chatbot"]') ||
        target.closest('[class*="chatbot"]') ||
        target.closest('iframe')
      ) {
        localStorage.setItem('chatbot-clicked', 'true');
        setIsVisible(false);
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleChatbotClick);

    return () => {
      document.removeEventListener('click', handleChatbotClick);
    };
  }, []);

  // Don't render anything until mounted on client
  if (!isMounted || !isVisible) return null;

  return (
    <div
      id="chatbot-ask-us-label"
      className="hidden md:block"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '90px',
        background: '#00AB50',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0, 171, 80, 0.4)',
        zIndex: 999999,
        pointerEvents: 'none',
        animation: 'pulse 2s ease-in-out infinite',
      }}
    >
      Ask Us
    </div>
  );
};
