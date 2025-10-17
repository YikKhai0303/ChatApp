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
import { useMediaQuery, useTheme } from "@mui/material";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
  if (chatrooms.length === 0)
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      px={2}
      textAlign="center"
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
      >
        No chatrooms yet. Tap “Create Chatroom” to get started.
      </Typography>
    </Box>
  );

  return (
    <List
      disablePadding
      sx={{
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        maxHeight: "100%",
        px: { xs: 0.5, sm: 1 },
        scrollBehavior: "smooth",
      }}
    >
      {chatrooms.map(room => (
        <ListItem key={room.id} disablePadding sx={{ position: "relative", "&:hover .chatroom-actions": { opacity: 1 }}}>
          <ListItemButton
            selected={selectedId === room.id}
            onClick={() => onSelect(room.id)}
            sx={{
              borderRadius: 1,
              py: { xs: 1, sm: 1.2 },
              px: { xs: 1, sm: 2 },
              "&.Mui-selected": {
                bgcolor: "#e3f2fd",
                "&:hover": { bgcolor: "#bbdefb" },
              },
            }}
          >
            <ListItemText
              primary={
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    fontWeight: 500,
                  }}
                >
                  {room.name}
                </Typography>
              }
              secondary={
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    color: "text.secondary",
                  }}
                >
                  {room.description}
                </Typography>
              }
            />
          </ListItemButton>
          <Box
            className="chatroom-actions"
            sx={{
              position: "absolute",
              right: { xs: 2, sm: 4 },
              top: { xs: 8, sm: 6 },
              opacity: { xs: 1, sm: 0 }, // ✅ always visible on mobile
              transition: "opacity 0.2s",
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, room)}
              aria-label="more"
              sx={{
                padding: { xs: 0.5, sm: 1 },
                "& svg": { fontSize: { xs: 18, sm: 20 } },
              }}
            >
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
      <Dialog
        open={editOpen}
        onClose={handleEditClose}
        fullScreen={isMobile}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            mt: { xs: "120px", sm: 0 }, // ✅ push dialog below the TopBar
            borderRadius: { xs: 0, sm: 2 }, // keep nice rounded corners on desktop
            overflow: "hidden",
          },
        }}
      >
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
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteClose}
        fullScreen={false} // 🟩 Disable fullScreen for mobile so it behaves like Edit
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            mt: { xs: "120px", sm: 0 }, // 🟩 consistent offset below TopBar
            mx: { xs: 2, sm: 0 }, // 🟩 small side margins on mobile
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 6, // 🟩 match Edit Chatroom popup shadow
          },
        }}
      >
      <DialogTitle>Delete Chatroom</DialogTitle>

      <DialogContent sx={{ overflow: "visible", mt: 1 }}>
        {menuChatroom && (
          <Typography sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}>
            Are you sure you want to delete{" "}
            <b>{menuChatroom.name}</b>? <br />
            <span style={{ color: "#e53935" }}>
              All conversation history will be deleted.
            </span>
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
        <Button
          onClick={handleDeleteClose}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            color: "error.main",
          }}
        >
          CANCEL
        </Button>
        <Button
          onClick={handleDeleteConfirm}
          variant="contained"
          color="error"
          sx={{
            textTransform: "none",
            fontWeight: 500,
            boxShadow: 1,
          }}
        >
          DELETE
        </Button>
      </DialogActions>
    </Dialog>

    </List>
  );
};

export default ChatroomList;
