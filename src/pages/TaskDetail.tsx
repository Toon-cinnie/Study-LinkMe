import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Calendar, DollarSign, User } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  client_id: string;
  freelancer_id: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Bid {
  id: string;
  amount: number;
  proposal: string;
  status: string;
  created_at: string;
  freelancer_id: string;
  profiles: {
    full_name: string;
  };
}

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidProposal, setBidProposal] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTaskAndBids();
    getCurrentUser();
  }, [id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchTaskAndBids = async () => {
    try {
      setLoading(true);
      
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select(`
          *,
          profiles!tasks_client_id_fkey (full_name, email)
        `)
        .eq("id", id)
        .single();

      if (taskError) throw taskError;
      setTask(taskData);

      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select(`
          *,
          profiles!bids_freelancer_id_fkey (full_name)
        `)
        .eq("task_id", id)
        .order("created_at", { ascending: false });

      if (bidsError) throw bidsError;
      setBids(bidsData || []);
    } catch (error: any) {
      toast.error("Failed to load task details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      toast.error("You must be logged in to place a bid");
      navigate("/auth");
      return;
    }

    if (!bidAmount || !bidProposal) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("bids").insert({
        task_id: id,
        freelancer_id: currentUserId,
        amount: parseFloat(bidAmount),
        proposal: bidProposal,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Bid submitted successfully!");
      setBidAmount("");
      setBidProposal("");
      fetchTaskAndBids();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit bid");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptBid = async (bidId: string, freelancerId: string) => {
    try {
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ 
          status: "in_progress",
          freelancer_id: freelancerId 
        })
        .eq("id", id);

      if (taskError) throw taskError;

      const { error: bidError } = await supabase
        .from("bids")
        .update({ status: "accepted" })
        .eq("id", bidId);

      if (bidError) throw bidError;

      const { error: rejectError } = await supabase
        .from("bids")
        .update({ status: "rejected" })
        .eq("task_id", id)
        .neq("id", bidId);

      if (rejectError) throw rejectError;

      toast.success("Bid accepted!");
      fetchTaskAndBids();
    } catch (error: any) {
      toast.error("Failed to accept bid");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="animate-pulse text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Task not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isClient = currentUserId === task.client_id;
  const hasUserBid = bids.some(bid => bid.freelancer_id === currentUserId);
  const canBid = task.status === "open" && !isClient && !hasUserBid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/tasks")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl mb-2">{task.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Posted by {task.profiles?.full_name || "Unknown"}
                    </CardDescription>
                  </div>
                  <Badge className="text-sm px-3 py-1">
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-primary">
                    <DollarSign className="h-5 w-5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="text-xl font-bold">₦{task.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-semibold">
                        {format(new Date(task.deadline), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {canBid && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Place Your Bid</CardTitle>
                  <CardDescription>
                    Submit your proposal and bid amount
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitBid} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bidAmount">Bid Amount (₦)</Label>
                      <Input
                        id="bidAmount"
                        type="number"
                        placeholder="Enter your bid"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proposal">Proposal</Label>
                      <Textarea
                        id="proposal"
                        placeholder="Explain why you're the best fit for this task..."
                        value={bidProposal}
                        onChange={(e) => setBidProposal(e.target.value)}
                        rows={5}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Bid"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Bids ({bids.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {bids.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">
                    No bids yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <Card key={bid.id} className="border-muted">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">
                                {bid.profiles?.full_name || "Unknown"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(bid.created_at), "MMM dd")}
                              </p>
                            </div>
                            <Badge variant={bid.status === "accepted" ? "default" : "outline"}>
                              ₦{bid.amount.toLocaleString()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {bid.proposal}
                          </p>
                          {isClient && task.status === "open" && bid.status === "pending" && (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleAcceptBid(bid.id, bid.freelancer_id)}
                            >
                              Accept Bid
                            </Button>
                          )}
                          {bid.status !== "pending" && (
                            <Badge className="w-full justify-center">
                              {bid.status}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
