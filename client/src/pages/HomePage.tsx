// src/pages/HomePage.tsx
import React from "react";
import Chat from "../components/Chat";

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Group Chat</h1>
      <Chat />
    </div>
  );
};

export default HomePage;
