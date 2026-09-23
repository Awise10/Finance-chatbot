import { useState } from 'react';
import AuthForm from './components/AuthForm.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import { api } from './api/client.js';

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <AuthForm onAuthed={setUser} />;

  return (
    <div className="app">
      <header>
        <h1>Finance Assistant</h1>
        <button
          onClick={async () => {
            await api.logout();
            setUser(null);
          }}
        >
          Log out
        </button>
      </header>
      <ChatWindow />
    </div>
  );
}
