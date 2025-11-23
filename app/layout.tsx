import type { Metadata } from 'next';
import './globals.css';
import { ChatbotLabel } from '@/components/ChatbotLabel';

export const metadata: Metadata = {
  title: 'UWP Manifesto Reader',
  description: 'Read the UWP 78-page manifesto with full search and navigation capabilities',
  keywords: ['UWP', 'manifesto', 'politics', 'policy', 'document reader'],
  icons: {
    icon: '/fav-uwp.png',
    apple: '/fav-uwp.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}

        {/* "Ask Us" floating label for chatbot */}
        <ChatbotLabel />

        {/* UWP AI Chatbot Widget */}
        {/* <script async
  src="https://thqi522cuv6kibxn6sbjajml.agents.do-ai.run/static/chatbot/widget.js"
  data-agent-id="72f2de28-c836-11f0-b074-4e013e2ddde4"
  data-chatbot-id="Yo1-CHReIBrXlRBDyrNNS7wULAuNKW70"
  data-name="UWP AI"
  data-primary-color="#FFEB3C"
  data-secondary-color="#FFEB3C"
  data-button-background-color="transparent"
  data-starting-message="Hello! How can I help you today?"
  data-logo="https://i.imgur.com/rN7Ggf8.png"
  data-user-message-bg-color="#d1fae5"
  data-bot-message-bg-color="#fef3c7">
</script> */}



<script async
  src="https://thqi522cuv6kibxn6sbjajml.agents.do-ai.run/static/chatbot/widget.js"
  data-agent-id="72f2de28-c836-11f0-b074-4e013e2ddde4"
  data-chatbot-id="Yo1-CHReIBrXlRBDyrNNS7wULAuNKW70"
  data-name="UWP AI"
  data-primary-color="#FFEB3C"
  data-secondary-color="#00AB50"
  data-button-background-color="#0061EB"
  data-starting-message="Hello! How can I help you today?"
  data-logo="https://i.imgur.com/rN7Ggf8.png">
</script>
        {/* Custom styling for chatbot messages */}
        {/* <script dangerouslySetInnerHTML={{__html: `
          (function() {
            function styleMessages() {
              // Try to access chatbot widget elements
              const chatContainer = document.querySelector('[class*="chat"]');
              if (!chatContainer) return;

              // Style AI/Bot messages
              const botMessages = chatContainer.querySelectorAll('[class*="bot"], [class*="assistant"], [data-sender="bot"], [data-sender="assistant"]');
              botMessages.forEach(msg => {
                msg.style.backgroundColor = '#fef3c7';
              });

              // Style User/Human messages
              const userMessages = chatContainer.querySelectorAll('[class*="user"], [class*="human"], [data-sender="user"], [data-sender="human"]');
              userMessages.forEach(msg => {
                msg.style.backgroundColor = '#d1fae5';
              });
            }

            // Run when DOM is ready and periodically to catch new messages
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', styleMessages);
            } else {
              styleMessages();
            }

            // Monitor for new messages
            setInterval(styleMessages, 1000);

            // Also watch for DOM mutations
            const observer = new MutationObserver(styleMessages);
            observer.observe(document.body, { childList: true, subtree: true });
          })();
        `}} /> */}
      </body>
    </html>
  );
}
