# Weather Chat App

A responsive weather chat interface powered by Mastra AI Agent, built using React + Tailwind CSS.

## Features

- Real-time chat interface with streaming weather updates
- User and agent message bubbles with timestamps
- Message search
- Graceful error handling

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

git clone https://github.com/adibirje14/weather-chat.git
cd weather-chat
npm install
# or
yarn install

# For Running the App: 
npm run dev
# or
yarn dev

Open http://localhost:3000 in your browser.

# API Endpoint: 
POST https://millions-screeching-vultur.mastra.cloud/api/agents/weatherAgent/stream

# Folder Structure
components/ChatWindow.tsx: Main chat interface
styles/global.css: Custom global and chat styling

# Testing: 
Manual test cases:
-> Query weather for multiple cities
-> Trigger error by disabling internet
-> Test search bar 

# To Do / Improvements:

-> Add persistent chat history
-> Use SWR/WebSocket for real-time sync
-> Improve mobile layout spacing
-> Add location-based weather suggestions
