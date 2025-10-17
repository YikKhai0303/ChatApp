// src/components/CreateChatroom.tsx
import { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, Snackbar, Alert } from "@mui/material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import ChatroomForm from "./ChatroomForm";

const CreateChatroom = ({ onDialogChange }: { onDialogChange?: (open: boolean) => void }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setDialogOpen(true);
    onDialogChange?.(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    onDialogChange?.(false);
  };

  const handleCreate = async (name: string, description: string) => {
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, "chatrooms"), {
        name,
        description,
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        createdBy: auth.currentUser?.uid
      });
      setDialogOpen(false);
      onDialogChange?.(false);
      setSnackbarOpen(true);
    } catch (err) {
      setError("Failed to create chatroom.");
    }
    setLoading(false);
  };

  return (
    <>
      <Button variant="contained" color="primary" fullWidth onClick={handleOpen}
      sx={{ mb: 2, textTransform: "none", fontWeight: 500, bgcolor: "#8e9aaf", "&:hover": { bgcolor: "#494c52" }, "&:focus": { outline: "none" }, "&:focus-visible": { outline: "none" }}}
      >CREATE CHATROOM
      </Button>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Create Chatroom</DialogTitle>
          <DialogContent sx={{ overflow: "visible" }}>
            <ChatroomForm onSubmit={handleCreate} onCancel={handleClose} loading={loading} submitLabel="CREATE" />
            {error && (<Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>)}
          </DialogContent>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={error ? "error" : "success"} sx={{ width: "100%" }}>
          {error ? error : "Chatroom created!"}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateChatroom;
