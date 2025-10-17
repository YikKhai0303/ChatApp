// src/components/TopBar.tsx
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

interface TopBarProps {
  dialogOpen?: boolean;
}

const TopBar = ({ dialogOpen = false }: TopBarProps) => {
  const [user] = useAuthState(auth);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLogout = () => {
    signOut(auth);
    setLogoutDialogOpen(false);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Toggle the menu open/close
    if (anchorEl) {
      setAnchorEl(null); // if already open, close it
    } else {
      setAnchorEl(event.currentTarget); // otherwise open it
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: "#6c757d",
          zIndex: 1400,
          pointerEvents: dialogOpen ? "none" : "auto",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 1.5, sm: 3 },
            minHeight: { xs: 56, sm: 64 },
          }}
        >
          {/* App Title */}
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "1rem", sm: "1.25rem" },
              fontWeight: 600,
            }}
          >
            ChatAppYK
          </Typography>

          {user && (
            <>
              {/* Desktop/Tablet View */}
              {!isMobile && (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={3}
                  sx={{ width: "auto" }}
                >
                  <Typography
                    noWrap
                    sx={{
                      maxWidth: 160,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "0.9rem",
                    }}
                  >
                    {user.displayName || user.email}
                  </Typography>

                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => setLogoutDialogOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 500,
                      bgcolor: "#8e9aaf",
                      "&:hover": { bgcolor: "#494c52" },
                      fontSize: "0.9rem",
                      px: 2,
                      py: 0.6,
                    }}
                  >
                    LOGOUT
                  </Button>
                </Box>
              )}

              {/* Mobile View */}
              {isMobile && (
                <>
                  <IconButton
                    color={Boolean(anchorEl) ? "primary" : "inherit"}
                    onClick={handleMenuOpen}
                    sx={{
                      p: 1,
                      border: "1px solid rgba(255,255,255,0.3)",
                      backgroundColor: Boolean(anchorEl) ? "rgba(255,255,255,0.15)" : "transparent",
                    }}
                  >
                    <MenuIcon />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <MenuItem disabled>
                      {user.displayName || user.email}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        setLogoutDialogOpen(true);
                      }}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { pt: 1, pb: 2, pr: 2, pl: 1 } }}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          Are you sure you want to log out{" "}
          {user?.displayName ? (
            <b>{user.displayName}</b>
          ) : user?.email ? (
            <b>{user.email}</b>
          ) : (
            "?"
          )}
          ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TopBar;