// src/components/TopBar.tsx
import { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

interface TopBarProps {
  dialogOpen?: boolean;
}

const TopBar = ({ dialogOpen = false }: TopBarProps) => {
  const [user] = useAuthState(auth);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    signOut(auth);
    setLogoutDialogOpen(false);
  };

  return (
    <>
      <AppBar position="fixed" color="primary" sx={{ bgcolor: "#6c757d", zIndex: 1400, pointerEvents: dialogOpen ? "none" : "auto"}}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>ChatAppYK</Typography>
          {user && (
            <Box display="flex" alignItems="center" gap={3}>
              <Typography>{user.displayName || user.email}</Typography>
              <Button variant="contained" color="inherit" onClick={() => setLogoutDialogOpen(true)}
              sx={{ textTransform: "none", fontWeight: 500, bgcolor: "#8e9aaf", "&:hover": { bgcolor: "#494c52" }}}>
                LOGOUT
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{sx: { pt: 1, pb: 2, pr:2, pl:1}}}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>Are you sure you want to log out
          {user?.displayName ? (<>, <b>{user.displayName}</b>?</>) : user?.email ? (<>(<b>{user.email}</b>)?</>) : ("?")}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLogout} color="error" variant="contained">Logout</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TopBar;
