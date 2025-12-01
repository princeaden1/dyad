import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
import { IpcClient } from "@/ipc/ipc_client";
import { GitBranch, Plus, Trash2, GitCommit } from "lucide-react";
import { showSuccess, showError } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";

interface BranchManagerProps {
  appId: number;
}

export function BranchManager({ appId }: BranchManagerProps) {
  const [branches, setBranches] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string | null>(null);
  const [newBranchName, setNewBranchName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const loadBranches = async () => {
    setIsLoading(true);
    try {
      const branchList = await IpcClient.getInstance().listBranches(appId);
      setBranches(branchList);

      const current = await IpcClient.getInstance().getCurrentBranch(appId);
      setCurrentBranch(current.branch); // BranchResult has branch property
    } catch (error: any) {
      console.error("Failed to load branches:", error);
      // Don't show error on initial load if it fails silently (e.g. no repo)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, [appId]);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    setIsCreating(true);
    try {
      await IpcClient.getInstance().createBranch(appId, newBranchName);
      showSuccess(`Created branch ${newBranchName}`);
      setNewBranchName("");
      loadBranches();
      // Optionally switch to it?
      if (confirm("Switch to new branch?")) {
        await handleSwitchBranch(newBranchName);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSwitchBranch = async (branch: string) => {
    try {
      await IpcClient.getInstance().switchBranch(appId, branch);
      showSuccess(`Switched to branch ${branch}`);
      loadBranches();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleDeleteBranch = async (branch: string) => {
    if (!confirm(`Are you sure you want to delete branch ${branch}?`)) return;

    try {
      await IpcClient.getInstance().deleteBranch(appId, branch);
      showSuccess(`Deleted branch ${branch}`);
      loadBranches();
    } catch (error: any) {
      showError(error.message);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GitBranch className="w-5 h-5" />
          Branches
        </CardTitle>
        <CardDescription>Manage Git branches for this project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Branch Display */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Current Branch:</span>
          </div>
          <Badge variant="secondary" className="font-mono">
            {currentBranch || "Unknown"}
          </Badge>
        </div>

        {/* Create Branch Form */}
        <form onSubmit={handleCreateBranch} className="flex gap-2">
          <Input
            placeholder="New branch name"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            disabled={isCreating}
          />
          <Button type="submit" disabled={isCreating || !newBranchName}>
            {isCreating ? (
              "Creating..."
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create
              </>
            )}
          </Button>
        </form>

        {/* Branch List */}
        <div className="space-y-2 mt-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Available Branches
          </h3>
          {isLoading ? (
            <div className="text-sm text-center py-4 text-gray-500">
              Loading branches...
            </div>
          ) : branches.length === 0 ? (
            <div className="text-sm text-center py-4 text-gray-500">
              No branches found.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {branches.map((branch) => (
                <div
                  key={branch}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-gray-400" />
                    <span
                      className={`text-sm ${branch === currentBranch ? "font-bold" : ""}`}
                    >
                      {branch}
                    </span>
                    {branch === currentBranch && (
                      <Badge variant="outline" className="text-xs h-5">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {branch !== currentBranch && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSwitchBranch(branch)}
                        >
                          Switch
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => handleDeleteBranch(branch)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
