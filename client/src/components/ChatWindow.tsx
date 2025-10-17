// src/components/ChatWindow.tsx
import { useEffect, useState, useRef } from "react";
import { Box, List, ListItem, ListItemText, Typography, CircularProgress, TextField, IconButton, Paper } from "@mui/material";
import { Dialog, DialogTitle,DialogContent, DialogActions, Button } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, QuerySnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Message } from "../types/message";
import type { DocumentData } from "firebase/firestore";
import { getGeminiReply } from "../services/gemini";
import ReactMarkdown from "react-markdown";
import { updateDoc, doc } from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";

interface ChatWindowProps {
  chatroomId: string;
}

const ChatWindow = ({ chatroomId }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [aiRevising, setAiRevising] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "chatrooms", chatroomId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    });
    return () => unsubscribe();
  }, [chatroomId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    setSending(true);

    await addDoc(collection(db, "chatrooms", chatroomId, "messages"), {
      text: input.trim(),
      sender: "user",
      timestamp: serverTimestamp(),
    });
    await updateDoc(doc(db, "chatrooms", chatroomId), {
      lastMessageTime: serverTimestamp(),
    });

    setInput("");
    setSending(false);
    setAiTyping(true);

    try {
      const promptMessages = messages
        .slice(-6)
        .map(m => ({
          role: m.sender === "user" ? "user" : "model" as "user" | "model",
          parts: [{ text: m.text }],
        }));

      promptMessages.push({
        role: "user",
        parts: [{ text: input.trim() }],
      });

      const aiReply = await getGeminiReply(promptMessages);

      await addDoc(collection(db, "chatrooms", chatroomId, "messages"), {
        text: aiReply,
        sender: "ai",
        timestamp: serverTimestamp(),
      });

      await updateDoc(doc(db, "chatrooms", chatroomId), {
        lastMessageTime: serverTimestamp(),
      });
    } catch (error) {
      await addDoc(collection(db, "chatrooms", chatroomId, "messages"), {
        text: "Sorry, I couldn't get a reply from the AI.",
        sender: "ai",
        timestamp: serverTimestamp(),
      });
    } finally {
      setAiTyping(false);
    }
  };

  if (loading) return <CircularProgress size={24} />;

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        px: { xs: 1, sm: 2 },
        pb: { xs: 1, sm: 2 },
      }}
    >
      <List ref={listRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          bgcolor: "background.paper",
          scrollBehavior: "smooth",
          px: { xs: 0.5, sm: 1.5 },
        }}>
        {messages.length === 0 && (
          <Typography color="textSecondary" sx={{ p: 2 }}>No messages yet. Start the conversation!</Typography>
        )}

        {messages.map((msg) => (
          <ListItem
            key={msg.id}
            sx={{
              flexDirection: "column",
              alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
              "&:hover .msg-actions": { opacity: 1 },
            }}
          >
            {/* Message Box */}
            <ListItemText
              primary={
                <ReactMarkdown
                  components={{
                  p: ({ children }) => (
                    <Typography
                      variant="body1"
                      component="div"
                      sx={{
                        fontSize: { xs: "0.85rem", sm: "1rem" },
                        lineHeight: { xs: 1.6, sm: 1.5 },
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }}
                    >
                      {children}
                    </Typography>
                  ),

                  // 🟩 NEW: bullet lists
                  ul: ({ children }) => (
                    <Box component="ul" sx={{ pl: 2.5, m: 0, fontSize: { xs: "0.85rem", sm: "1rem" } }}>
                      {children}
                    </Box>
                  ),

                  // 🟩 NEW: numbered lists
                  ol: ({ children }) => (
                    <Box component="ol" sx={{ pl: 2.5, m: 0, fontSize: { xs: "0.85rem", sm: "1rem" } }}>
                      {children}
                    </Box>
                  ),

                  // 🟩 NEW: headers like ## Title
                  h1: ({ children }) => (
                    <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, fontWeight: 600, mb: 0.5 }}>
                      {children}
                    </Typography>
                  ),

                  h2: ({ children }) => (
                    <Typography variant="subtitle1" sx={{ fontSize: { xs: "0.95rem", sm: "1.1rem" }, fontWeight: 600, mb: 0.5 }}>
                      {children}
                    </Typography>
                  ),

                  strong: ({ children }) => <strong>{children}</strong>,
                  em: ({ children }) => <em>{children}</em>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1976d2" }}
                    >
                      {children}
                    </a>
                  ),
                }}

                >
                  {msg.text}
                </ReactMarkdown>
              }
              sx={{
                textAlign: msg.sender === "user" ? "right" : "left",
                bgcolor: msg.sender === "user" ? "#e3f2fd" : "#fffde7",
                borderRadius: 2,
                px: 2,
                py: 1,
                maxWidth: { xs: "90%", sm: "70%" },
                minWidth: { xs: "65%", sm: "auto" },
                overflowWrap: "break-word",
                wordBreak: "break-word",
                fontSize: { xs: "0.85rem", sm: "1rem" },
                width: "fit-content",
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              }}
            />

            {/* Action Button */}
            <Box
              className="msg-actions"
              sx={{
                display: "flex",
                gap: 1,
                opacity: { xs: 1, sm: 0 },
                transition: "opacity 0.2s",
                mt: 0.5,
               }}
            >
              {/* Edit icon only for user messages */}
              {msg.sender === "user" && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedMessage(msg);
                    setEditText(msg.text);
                    setEditDialogOpen(true);
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#1976d2" }}>✏️</Typography>
                </IconButton>
              )}

              {/* Delete icon for both user & AI messages */}
              <IconButton
                size="small"
                onClick={() => {
                  setMessageToDelete(msg);
                  setDeleteDialogOpen(true);
                }}
              >
                <Typography variant="caption" sx={{ color: "#d32f2f" }}>🗑️</Typography>
              </IconButton>
            </Box>
          </ListItem>
        ))}

        {/* AI typing indicator */}
        {(aiTyping || aiRevising) && (
          <ListItem sx={{ justifyContent: "flex-start" }}>
            <ListItemText
              primary={
                <Typography
                  fontStyle="italic"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {aiRevising ? "AI is updating response…" : "AI is typing…"}
                </Typography>
              }
              sx={{
                textAlign: "left",
                bgcolor: "#fffde7",
                borderRadius: 2,
                px: 2,
                py: 0.5,
                maxWidth: "70%",
              }}
            />
          </ListItem>
        )}
      </List>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{sx: { pt: 1, pb: 2, pr:2, pl:1}}}
      >
        <DialogTitle>Edit Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            sx={{ mt: 1 }}
            inputProps={{
              maxLength: 500,
              style: { fontSize: "0.95rem" },
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              !selectedMessage || editText.trim() === "" || editText.trim() === selectedMessage.text.trim()
            }
            sx={{ textTransform: "none", fontWeight: 500, bgcolor: "#8e9aaf", "&:hover": { bgcolor: "#494c52" }}}
            onClick={async () => {
              if (!selectedMessage) return;
              setEditDialogOpen(false);
              setAiTyping(false);
              setAiRevising(true);
              const msgRef = doc(db, "chatrooms", chatroomId, "messages", selectedMessage.id);

              try {
                // Update user message
                await updateDoc(msgRef, { text: editText.trim() });

                // Delete next AI message (if any)
                const userIndex = messages.findIndex((m) => m.id === selectedMessage.id);
                const nextMsg = messages[userIndex + 1];
                if (nextMsg && nextMsg.sender === "ai") {
                  await deleteDoc(doc(db, "chatrooms", chatroomId, "messages", nextMsg.id));
                }

                // Rebuild context for new AI response
                const contextMessages = messages
                  .slice(Math.max(0, userIndex - 6), userIndex)
                  .map((m) => ({
                    role: m.sender === "user" ? "user" : "model" as "user" | "model",
                    parts: [{ text: m.text }],
                  }));

                contextMessages.push({
                  role: "user",
                  parts: [{ text: editText.trim() }],
                });

                // Get new AI reply
                const aiReply = await getGeminiReply(contextMessages);

                // Add new AI reply
                // Reuse the deleted AI’s timestamp if available, otherwise fallback
                const aiTimestamp = nextMsg?.timestamp || serverTimestamp();

                await addDoc(collection(db, "chatrooms", chatroomId, "messages"), {
                  text: aiReply,
                  sender: "ai",
                  timestamp: aiTimestamp,
                });

                await updateDoc(doc(db, "chatrooms", chatroomId), {
                  lastMessageTime: serverTimestamp(),
                });
              } catch (error) {
                console.error("Error while editing message:", error);
              } finally {
                  setAiRevising(false);
                  setAiTyping(false);
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { pt: 1, pb: 2, pr: 2, pl: 2 } }}
      >
        <DialogTitle>Delete Chat</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete this message?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
              fontWeight: 500,
              bgcolor: "#d32f2f",
              "&:hover": { bgcolor: "#9a0007" },
            }}
            onClick={async () => {
              if (!messageToDelete) return;
              try {
                await deleteDoc(doc(db, "chatrooms", chatroomId, "messages", messageToDelete.id));
              } catch (error) {
                console.error("Error deleting message:", error);
              } finally {
                setDeleteDialogOpen(false);
                setMessageToDelete(null);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Input */}
      <Paper
        component="form"
        onSubmit={handleSend}
        sx={{
          display: "flex",
          alignItems: "center",
          p: { xs: 0.5, sm: 1 },
          mt: 1,
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "#fff",
          borderTop: "1px solid #ddd",
          overflow: "hidden",
          zIndex: 5,
        }}
        elevation={3}
      >
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          fullWidth
          size="small"
          InputProps={{
            sx: { fontSize: { xs: "0.9rem", sm: "1rem" } },
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) handleSend(e as any);
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={sending || !input.trim()}
          sx={{ ml: { xs: 0, sm: 1 } }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );

};

export default ChatWindow;
