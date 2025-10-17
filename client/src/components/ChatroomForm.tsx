// src/components/ChatroomForm.tsx
import { useState, useEffect } from "react";
import { Box, TextField, Button, Stack } from "@mui/material";

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
      <Stack spacing={2} sx={{ width: "100%", minWidth: 280 }}>
        <TextField label="Chatroom Name" value={name} onChange={e => setName(e.target.value)} required fullWidth margin="normal" size="small" />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth margin="normal" size="small" />
        {error && <Box color="error.main">{error}</Box>}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onCancel} disabled={loading} color="error" sx={{ textTransform: "none", fontWeight: 500}}>CANCEL</Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: "none", fontWeight: 500, bgcolor: "#8e9aaf", "&:hover": { bgcolor: "#494c52" }}}>{submitLabel}</Button>
        </Stack>
      </Stack>
    </form>
  );
}
