// src/App.tsx
import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { auth } from "./services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import AuthForm from "./components/AuthForm";
import TopBar from "./components/TopBar";
import CreateChatroom from "./components/CreateChatroom";
import ChatroomList from "./components/ChatroomList";
import ChatWindow from "./components/ChatWindow";

function App() {
  const [user, loading] = useAuthState(auth);
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>(
    () => localStorage.getItem("selectedChatroom") || undefined
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      localStorage.removeItem("selectedChatroom");
      setSelectedRoom(undefined);
    }
  }, [user, loading]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <AuthForm />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Menu Bar */}
      <TopBar dialogOpen={dialogOpen} />
      <Box sx={{ height: 64 }} />

      {/* Main Content - Chatroom List & Chat Window */}
      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Left - Chatrom List */}
        <Box width={250} bgcolor="#f5f3f4" p={2} boxShadow={2} sx={{ display: "flex", flexDirection: "column" }}>
          <CreateChatroom onDialogChange={setDialogOpen} />
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <ChatroomList
              selectedId={selectedRoom}
              onSelect={(id) => {
                setSelectedRoom(id);
                localStorage.setItem("selectedChatroom", id);
              }}
              onDialogChange={setDialogOpen}
            />
          </Box>
        </Box>
        {/* Right - Chat Window */}
        <Box sx={{ flex: 1, minWidth: 0, p: 2 }}>
          {selectedRoom ? (
            <ChatWindow chatroomId={selectedRoom} />
          ) : (
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <h2>Welcome to ChatApp</h2>
              <h4>Select or create a chatroom</h4>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default App;
