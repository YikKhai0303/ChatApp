// src/components/AuthForm.tsx
import { useState } from "react";
import { TextField, Button, Box, Typography, Link, CircularProgress } from "@mui/material";
import { auth } from "../services/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";

type Mode = "login" | "register";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Register
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: username });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor="#ffffff" px={2}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1, color: "#212529" }}>Welcome to ChatAppYK</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "#495057", textAlign: "center", maxWidth: 400 }}>Your AI-powered chat companion.</Typography>
      
      <Box maxWidth={340} mx="auto" p={3} boxShadow={3} borderRadius={2} bgcolor="#f5f3f4" border={1} borderColor="#cccccc">
        <Typography variant="h5" align="center" sx={{ fontWeight: "bold" }}>{mode === "login" ? "Login" : "Register"}</Typography>
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} fullWidth margin="normal" required />
          )}
          <TextField label="Email Address" value={email} onChange={e => setEmail(e.target.value)} type="email" fullWidth margin="normal" required />
          <TextField label="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" fullWidth margin="normal" required />
          {error && <Typography color="error" variant="body2" mt={1}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, textTransform: "none", fontWeight: 500, bgcolor: "#8e9aaf", "&:hover": { bgcolor: "#494c52" }}} disabled={loading}>
            {loading ? <CircularProgress size={22} /> : (mode === "login" ? "LOGIN" : "REGISTER")}
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          {mode === "login" ? (
            <Typography variant="body2">
              Do not have an account?{" "}
              <Link component="button" onClick={switchMode} underline="always" sx={{"&:focus": { outline: "none" }, "&:focus-visible": { outline: "none" }}}>
              Register here.
              </Link>
            </Typography>
            ) : (
            <Typography variant="body2">
              Already have an account?{" "}
              <Link component="button" onClick={switchMode} underline="always" sx={{"&:focus": { outline: "none" }, "&:focus-visible": { outline: "none" }}}>
              Login here.
            </Link>
            </Typography>
        )}
        </Box>
      </Box>
    </Box>
  );
}
