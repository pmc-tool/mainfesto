import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UWP Manifesto Reader',
  description: 'Read the UWP 78-page manifesto with full search and navigation capabilities',
  keywords: ['UWP', 'manifesto', 'politics', 'policy', 'document reader'],
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

        {/* UWP AI Chatbot Widget */}
        <script async
  src="https://thqi522cuv6kibxn6sbjajml.agents.do-ai.run/static/chatbot/widget.js"
  data-agent-id="72f2de28-c836-11f0-b074-4e013e2ddde4"
  data-chatbot-id="Yo1-CHReIBrXlRBDyrNNS7wULAuNKW70"
  data-name="UWP AI"
  data-primary-color="#00AB50"
  data-secondary-color="#FFEB3C"
  data-button-background-color="#0061EB"
  data-starting-message="Hello! How can I help you today?"
  data-logo="https://i.imgur.com/eRnE89P.png">
</script>
      </body>
    </html>
  );
}
