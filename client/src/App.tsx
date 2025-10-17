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
import { IconButton, useMediaQuery, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function App() {
  const [user, loading] = useAuthState(auth);
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>(
    () => localStorage.getItem("selectedChatroom") || undefined
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    else setSidebarOpen(true);
  }, [isMobile]);

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

      {/* Main Content */}
     <Box
  sx={{
    display: "flex",
    flex: 1,
    minHeight: 0,
    position: "relative",
    overflow: "hidden",
  }}
>
  {/* ───────────── Sidebar ───────────── */}
  <Box
    sx={{
      position: { xs: "fixed", md: "relative" },
      zIndex: { xs: 20, md: "auto" },
      top: { xs: 64, md: 0 },
      left: 0,
      height: { xs: "calc(100% - 64px)", md: "100%" },
      width: sidebarOpen
        ? { xs: "80%", sm: 280, md: 250 }
        : { xs: 0, md: 48 },
      transition: "width 0.3s ease, transform 0.3s ease",
      transform: {
        xs: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        md: "translateX(0)",
      },
      bgcolor: "#f5f3f4",
      boxShadow: sidebarOpen ? 4 : 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}
  >
  {/* Sidebar Content */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: 2, // 🟩 add left & right padding for breathing space
      py: 1,
      mb: 1,
      gap: 1, // 🟩 adds small gap between button & icon
    }}
  >
    {/* Create Chatroom visible only when sidebar expanded */}
    {sidebarOpen && (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <CreateChatroom onDialogChange={setDialogOpen} />
      </Box>
    )}

    {/* Collapse (<) Button — visible on both desktop and mobile when sidebar open */}
    {sidebarOpen && (
      <IconButton
        onClick={() => setSidebarOpen(false)}
        size="small"
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: 1,
          "&:hover": { backgroundColor: "#f0f0f0" },
          transition: "all 0.3s ease",
          flexShrink: 0, // 🟩 prevent resizing
        }}
      >
        <ChevronLeftIcon />
      </IconButton>
    )}

  {/* Expand (>) Button — visible only on desktop when collapsed */}
  {!sidebarOpen && !isMobile && (
    <IconButton
      onClick={() => setSidebarOpen(true)}
      size="small"
      sx={{
        backgroundColor: "#ffffff",
        boxShadow: 1,
        "&:hover": { backgroundColor: "#f0f0f0" },
        transition: "all 0.3s ease",
      }}
    >
      <ChevronRightIcon />
    </IconButton>
  )}
  </Box>

    {/* Chatroom List */}
    {sidebarOpen && (
      <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, px: 1 }}>
        <ChatroomList
          selectedId={selectedRoom}
          onSelect={(id) => {
            setSelectedRoom(id);
            localStorage.setItem("selectedChatroom", id);
            if (isMobile) setSidebarOpen(false);
          }}
          onDialogChange={setDialogOpen}
        />
      </Box>
    )}
  </Box>
  {/* ───────────── End Sidebar ───────────── */}

  {/* ✅ Floating Expand Button — must be OUTSIDE sidebar */}
  {!sidebarOpen && (
    <IconButton
      onClick={() => setSidebarOpen(true)}
      size="small"
      sx={{
        position: "fixed",
        top: 72,
        left: 8,
        zIndex: 25,
        bgcolor: "#ffffff",
        boxShadow: 2,
        border: "1px solid #ccc",
        "&:hover": { bgcolor: "#f0f0f0" },
        transition: "all 0.3s ease",
        display: { xs: "flex", md: "none" }, // only mobile
      }}
    >
      <ChevronRightIcon />
    </IconButton>
  )}

  {/* Dim background */}
  {isMobile && sidebarOpen && (
    <Box
      onClick={() => setSidebarOpen(false)}
      sx={{
        position: "fixed",
        top: 64,
        left: 0,
        width: "100%",
        height: "calc(100% - 64px)",
        bgcolor: "rgba(0,0,0,0.3)",
        zIndex: 10,
      }}
    />
  )}

  {/* Chat Window */}
  <Box sx={{ flex: 1, minWidth: 0, p: 2, height: "100%", overflow: "hidden" }}>
    {selectedRoom ? (
      <ChatWindow chatroomId={selectedRoom} />
    ) : (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
