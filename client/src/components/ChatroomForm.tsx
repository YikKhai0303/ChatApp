// src/components/ChatroomForm.tsx
import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";

interface ChatroomFormProps {
  initialName?: string;
  initialDescription?: string;
  loading?: boolean;
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export default function ChatroomForm({
  initialName = "",
  initialDescription = "",
  loading = false,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: ChatroomFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState<string | null>(null);

  // ✅ Detect small screens for layout adjustments
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
  }, [initialName, initialDescription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Chatroom name is required.");
      return;
    }
    onSubmit(name.trim(), description.trim());
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack
        spacing={2}
        sx={{
          width: "100%",
          mt: 1,
          "& .MuiTextField-root": {
            width: "100%", // ✅ ensure fields stretch evenly
          },
        }}
      >
        <TextField
          label="Chatroom Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          margin="normal"
          size="small"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          size="small"
        />

        {error && (
          <Box color="error.main" sx={{ fontSize: "0.85rem" }}>
            {error}
          </Box>
        )}

        {/* ✅ Responsive button layout */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="flex-end"
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ mt: 1 }}
        >
          <Button
            onClick={onCancel}
            disabled={loading}
            color="error"
            fullWidth={isMobile}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
              py: 1,
            }}
          >
            CANCEL
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth={isMobile}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
              bgcolor: "#8e9aaf",
              "&:hover": { bgcolor: "#494c52" },
              py: 1,
            }}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
