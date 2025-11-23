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

        <ChatbotLabel />

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
      </body>
    </html>
  );
}
