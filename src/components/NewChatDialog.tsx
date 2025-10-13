import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
  onStartChat: (userId: string) => Promise<void> | void;
}

export default function NewChatDialog({ open, onOpenChange, currentUserId, onStartChat }: NewChatDialogProps) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; full_name: string | null; email: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!open || !currentUserId) return;
      try {
        setLoading(true);
        let query = supabase
          .from("profiles")
          .select("id, full_name, email")
          .neq("id", currentUserId)
          .limit(20);

        if (search.trim()) {
          query = query.ilike("full_name", `%${search.trim()}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        setUsers(data || []);
      } catch (e) {
        console.error("Failed to load users", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, search, currentUserId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">New Chat</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a new chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Search students by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-64 overflow-y-auto border rounded-md p-2">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-sm text-muted-foreground">No users found.</div>
            ) : (
              users.map((u) => (
                <Button
                  key={u.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={async () => {
                    await onStartChat(u.id);
                  }}
                >
                  {u.full_name || u.email}
                </Button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
