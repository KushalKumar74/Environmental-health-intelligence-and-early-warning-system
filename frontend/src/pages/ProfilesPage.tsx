import { useState } from "react";
import { User, Plus, Pencil, Trash2, Check, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProfiles, type Profile } from "@/store/profiles";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ProfilesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profiles, addProfile, updateProfile, deleteProfile } = useProfiles();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Profile>>({});

  const [isAdding, setIsAdding] = useState(false);
  const [newProfile, setNewProfile] = useState<{
    name: string;
    age: string;
    asthma: boolean;
    allergies: boolean;
    diabetes: boolean;
    heartDisease: boolean;
  }>({
    name: "",
    age: "",
    asthma: false,
    allergies: false,
    diabetes: false,
    heartDisease: false,
  });

  if (!user) {
    return (
      <div className="container py-12 max-w-lg text-center space-y-4">
        <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to manage your saved health profiles.</p>
        <Button onClick={() => navigate("/login", { state: { from: "/profiles" } })}>Log In</Button>
      </div>
    );
  }

  const handleStartEdit = (p: Profile) => {
    setEditingId(p._id);
    setDraft({
      name: p.name,
      age: p.age ?? undefined,
      asthma: p.asthma ?? false,
      allergies: p.allergies ?? false,
      diabetes: p.diabetes ?? false,
      heartDisease: p.heartDisease ?? false,
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateProfile(id, draft);
      setEditingId(null);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleCreate = async () => {
    if (!newProfile.name.trim()) return toast.error("Profile name is required");
    try {
      await addProfile({
        name: newProfile.name.trim(),
        age: newProfile.age ? Number(newProfile.age) : null,
        asthma: newProfile.asthma,
        allergies: newProfile.allergies,
        diabetes: newProfile.diabetes,
        heartDisease: newProfile.heartDisease,
      });
      toast.success("Profile created!");
      setIsAdding(false);
      setNewProfile({ name: "", age: "", asthma: false, allergies: false, diabetes: false, heartDisease: false });
    } catch (e: any) {
      toast.error(e.message || "Failed to create profile");
    }
  };

  return (
    <div className="container py-8 space-y-6 max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-7 w-7 text-primary" /> Saved Profiles
          </h1>
          <p className="text-muted-foreground">
            Manage reusable health profiles for consistency across predictions and analytics.
          </p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-1.5" />
          {isAdding ? "Cancel" : "New Profile"}
        </Button>
      </header>

      {/* New profile creation form card */}
      {isAdding && (
        <Card className="p-6 space-y-4 bg-secondary/30 animate-fade-in border-primary/30">
          <h3 className="text-lg font-semibold">Add New Profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="prof-name">Profile Name <span className="text-destructive">*</span></Label>
              <Input
                id="prof-name"
                placeholder="e.g. Sara, Dad, Self"
                value={newProfile.name}
                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prof-age">Age</Label>
              <Input
                id="prof-age"
                type="number"
                min={1}
                max={120}
                placeholder="Age"
                value={newProfile.age}
                onChange={(e) => setNewProfile({ ...newProfile, age: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Default Health Conditions</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: "asthma", label: "Asthma", val: newProfile.asthma, key: "asthma" },
                { id: "allergies", label: "Seasonal Allergies", val: newProfile.allergies, key: "allergies" },
                { id: "diabetes", label: "Diabetes", val: newProfile.diabetes, key: "diabetes" },
                { id: "heart", label: "Heart Disease", val: newProfile.heartDisease, key: "heartDisease" },
              ].map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border p-3 bg-background">
                  <Label htmlFor={c.id} className="text-sm cursor-pointer">{c.label}</Label>
                  <Switch
                    id={c.id}
                    checked={c.val}
                    onCheckedChange={(v) => setNewProfile({ ...newProfile, [c.key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Save Profile</Button>
          </div>
        </Card>
      )}

      {/* Profiles list */}
      {profiles.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-card">
          <User className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No saved profiles yet</p>
          <p className="text-sm text-muted-foreground">
            Create profiles here or save them directly when filling out the Predict page.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile Name</TableHead>
                  <TableHead>Default Age</TableHead>
                  <TableHead>Health Conditions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => {
                  const isEdit = editingId === p._id;
                  return (
                    <TableRow key={p._id}>
                      <TableCell className="font-semibold">
                        {isEdit ? (
                          <Input
                            className="h-8 w-36"
                            value={draft.name ?? p.name}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                          />
                        ) : (
                          p.name
                        )}
                      </TableCell>

                      <TableCell>
                        {isEdit ? (
                          <Input
                            type="number"
                            className="h-8 w-20"
                            value={draft.age ?? p.age ?? ""}
                            onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) || null })}
                          />
                        ) : (
                          p.age ?? "—"
                        )}
                      </TableCell>

                      <TableCell className="text-xs">
                        {isEdit ? (
                          <div className="flex flex-col gap-1.5 min-w-[130px]">
                            <label className="flex items-center justify-between gap-1 cursor-pointer">
                              <span>Asthma</span>
                              <Switch
                                checked={draft.asthma ?? p.asthma ?? false}
                                onCheckedChange={(v) => setDraft({ ...draft, asthma: v })}
                              />
                            </label>
                            <label className="flex items-center justify-between gap-1 cursor-pointer">
                              <span>Allergies</span>
                              <Switch
                                checked={draft.allergies ?? p.allergies ?? false}
                                onCheckedChange={(v) => setDraft({ ...draft, allergies: v })}
                              />
                            </label>
                            <label className="flex items-center justify-between gap-1 cursor-pointer">
                              <span>Diabetes</span>
                              <Switch
                                checked={draft.diabetes ?? p.diabetes ?? false}
                                onCheckedChange={(v) => setDraft({ ...draft, diabetes: v })}
                              />
                            </label>
                            <label className="flex items-center justify-between gap-1 cursor-pointer">
                              <span>Heart</span>
                              <Switch
                                checked={draft.heartDisease ?? p.heartDisease ?? false}
                                onCheckedChange={(v) => setDraft({ ...draft, heartDisease: v })}
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {p.asthma && <span className="rounded bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 px-2 py-0.5 font-medium">Asthma</span>}
                            {p.allergies && <span className="rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 font-medium">Allergies</span>}
                            {p.diabetes && <span className="rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 font-medium">Diabetes</span>}
                            {p.heartDisease && <span className="rounded bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 px-2 py-0.5 font-medium">Heart</span>}
                            {!p.asthma && !p.allergies && !p.diabetes && !p.heartDisease && (
                              <span className="text-muted-foreground italic">None</span>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {isEdit ? (
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(p._id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => handleStartEdit(p)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Profile?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete profile "{p.name}"? Past health records saved under this name will remain in your history.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => { deleteProfile(p._id); toast.success("Profile deleted"); }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
