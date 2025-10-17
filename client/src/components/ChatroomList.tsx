// src/components/ChatroomList.tsx
import { useEffect, useState } from "react";
import {
  List, ListItem, ListItemButton, ListItemText, CircularProgress, Typography, IconButton,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { collection, onSnapshot, QuerySnapshot, query, where, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import type { Chatroom } from "../types/chatroom";
import type { DocumentData } from "firebase/firestore";
import ChatroomForm from "./ChatroomForm";

interface ChatroomListProps {
  selectedId?: string;
  onSelect: (id: string) => void;
  onDialogChange?: (open: boolean) => void;
}

const ChatroomList = ({ selectedId, onSelect, onDialogChange }: ChatroomListProps) => {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuChatroom, setMenuChatroom] = useState<Chatroom | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "chatrooms"),
      where("createdBy", "==", auth.currentUser.uid),
      orderBy("lastMessageTime", "desc"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Chatroom[];
      setChatrooms(rooms);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, chatroom: Chatroom) => {
    setMenuAnchor(event.currentTarget);
    setMenuChatroom(chatroom);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Edit
  const openEditDialog = () => {
    setEditOpen(true);
    handleMenuClose();
    onDialogChange?.(true);
  };

  const handleEditSave = async (name: string, description: string) => {
    if (menuChatroom) {
      await updateDoc(doc(db, "chatrooms", menuChatroom.id), {
        name, description
      });
    }
    setEditOpen(false);
    setMenuChatroom(null);
    onDialogChange?.(false);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setMenuChatroom(null);
    onDialogChange?.(false);
  };

  // Delete
  const openDeleteDialog = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
    onDialogChange?.(true);
  };

  const handleDeleteConfirm = async () => {
    if (menuChatroom) {
      await deleteDoc(doc(db, "chatrooms", menuChatroom.id));
    }
    setDeleteConfirmOpen(false);
    setMenuChatroom(null);
    onDialogChange?.(false);
  };

  const handleDeleteClose = () => {
    setDeleteConfirmOpen(false);
    setMenuChatroom(null);
    onDialogChange?.(false);
  };

  if (loading) return <CircularProgress size={24} />;
  if (chatrooms.length === 0) return <Typography variant="body2" color="textSecondary">No chatrooms yet.</Typography>;

  return (
    <List>
      {chatrooms.map(room => (
        <ListItem key={room.id} disablePadding sx={{ position: "relative", "&:hover .chatroom-actions": { opacity: 1 }}}>
          <ListItemButton selected={selectedId === room.id} onClick={() => onSelect(room.id)}>
            <ListItemText primary={room.name} secondary={room.description} />
          </ListItemButton>

          <Box className="chatroom-actions" sx={{position: "absolute", right: 4, top: 6, opacity: 0, transition: "opacity 0.2s"}}>
            <IconButton size="small" onClick={e => handleMenuOpen(e, room)} aria-label="more">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </ListItem>
      ))}

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={handleMenuClose}>
        <MenuItem onClick={openEditDialog}>Edit</MenuItem>
        <MenuItem onClick={openDeleteDialog} sx={{ color: "error.main" }}>Delete</MenuItem>
      </Menu>

      {/* Edit */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Chatroom</DialogTitle>
        <DialogContent sx={{ overflow: "visible" }}>
          {menuChatroom && (
            <ChatroomForm initialName={menuChatroom.name} initialDescription={menuChatroom.description}
              onSubmit={handleEditSave} onCancel={handleEditClose} submitLabel="SAVE"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteClose} maxWidth="xs" fullWidth PaperProps={{sx: { pt: 1, pb: 2, pr:2, pl:1}}}>
        <DialogTitle>Delete Chatroom</DialogTitle>
        <DialogContent>
          {menuChatroom && (
            <Typography>
              Are you sure you want to delete "<b>{menuChatroom.name}</b>"? <br />
              <span style={{ color: "#e53935" }}>All conversation history will be deleted.</span>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </List>
  );
};

export default ChatroomList;
