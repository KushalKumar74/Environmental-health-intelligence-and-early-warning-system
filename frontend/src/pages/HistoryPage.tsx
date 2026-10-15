import { useState } from "react";
import { Trash2, Pencil, Check, X, History as HistoryIcon, Download, FileText, Shield, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRecords, type HealthRecord } from "@/store/records";
import { predictRisk, RISK_BG } from "@/lib/prediction";
import { toast } from "sonner";
import { downloadRecordsCSV, downloadAnalyticsPDF } from "@/lib/exportUtils";
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
import { useAuth } from "@/contexts/AuthContext";

export default function HistoryPage() {
  const { records, update, remove, clear } = useRecords();
  const { user } = useAuth();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<HealthRecord>>({});

  const startEdit = (r: HealthRecord) => {
    setEditing(r._id);
    setDraft({
      name: r.name,
      age: r.age,
      asthma: r.asthma,
      allergies: r.allergies,
      diabetes: r.diabetes,
      heartDisease: r.heartDisease,
      hoursOutside: r.hoursOutside,
    });
  };

  const saveEdit = (r: HealthRecord) => {
    update(r._id, { ...draft });
    setEditing(null);
    toast.success("Record updated");
  };

  const handleExportCSV = () => {
    if (records.length === 0) return toast.error("No records to export");
    downloadRecordsCSV(records);
    toast.success("CSV file downloaded!");
  };

  const handleExportPDF = () => {
    if (records.length === 0) return toast.error("No records to export");
    downloadAnalyticsPDF(records, user?.name);
    toast.success("PDF report downloaded!");
  };

  return (
    <div className="container py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground">{records.length} record{records.length === 1 ? "" : "s"} saved</p>
        </div>
        {records.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1.5" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-1.5" /> Export PDF
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                  Clear all
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All History Records?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your saved health risk records will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { clear(); toast.success("All records cleared"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </header>

      {records.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-card">
          <HistoryIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No records yet</p>
          <p className="text-sm text-muted-foreground">Save a prediction from the Predict page to see it here.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Mask / Activity</TableHead>
                  <TableHead>Hrs out</TableHead>
                  <TableHead>AQI</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => {
                  const isEdit = editing === r._id;
                  return (
                    <TableRow key={r._id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString()}
                      </TableCell>
                      {/* Name cell */}
                      <TableCell className="font-medium">
                        {isEdit ? (
                          <Input
                            type="text"
                            className="h-8 w-28"
                            placeholder="Name"
                            value={draft.name ?? r.name ?? ""}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                          />
                        ) : (r.name ?? "—")}
                      </TableCell>
                      <TableCell className="text-sm">{r.location ?? "—"}</TableCell>
                      <TableCell>
                        {isEdit ? (
                          <Input
                            type="number"
                            className="h-8 w-20"
                            value={draft.age ?? r.age}
                            onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) })}
                          />
                        ) : r.age}
                      </TableCell>
                      <TableCell className="text-xs">
                        {isEdit ? (
                          <div className="flex flex-col gap-1.5 min-w-[120px]">
                            <label className="flex items-center justify-between gap-1 cursor-pointer">
                              <span>Asthma</span>
                              <Switch
                                checked={draft.asthma ?? r.asthma}
                                onCheckedChange={(v) => setDraft({ ...draft, asthma: v })}
                              />
                            </label>
                            <label className="flex items-center justify-between gap-1 cursor-pointer">
                              <span>Allergies</span>
                              <Switch
                                checked={draft.allergies ?? r.allergies ?? false}
                                onCheckedChange={(v) => setDraft({ ...draft, allergies: v })}
                              />
                            </label>
                            <label className="flex items-center justify-between gap-1 cursor-pointer">
                              <span>Diabetes</span>
                              <Switch
                                checked={draft.diabetes ?? r.diabetes ?? false}
                                onCheckedChange={(v) => setDraft({ ...draft, diabetes: v })}
                              />
                            </label>
                            <label className="flex items-center justify-between gap-1 cursor-pointer">
                              <span>Heart</span>
                              <Switch
                                checked={draft.heartDisease ?? r.heartDisease ?? false}
                                onCheckedChange={(v) => setDraft({ ...draft, heartDisease: v })}
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span>Asthma: {r.asthma ? "Yes" : "No"}</span>
                            {r.allergies && <span className="text-amber-600 dark:text-amber-400">Allergies: Yes</span>}
                            {r.diabetes && <span className="text-blue-600 dark:text-blue-400">Diabetes: Yes</span>}
                            {r.heartDisease && <span className="text-rose-600 dark:text-rose-400">Heart: Yes</span>}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs capitalize">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1">
                            <Shield className="h-3 w-3 text-muted-foreground" /> {r.maskType || "none"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Activity className="h-3 w-3" /> {r.exerciseIntensity || "sedentary"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isEdit ? (
                          <Input
                            type="number"
                            step={0.5}
                            className="h-8 w-20"
                            value={draft.hoursOutside ?? r.hoursOutside}
                            onChange={(e) => setDraft({ ...draft, hoursOutside: Number(e.target.value) })}
                          />
                        ) : `${r.hoursOutside}h`}
                      </TableCell>
                      <TableCell>{r.aqi}/5</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold text-white ${RISK_BG[r.predictedRisk]}`}>
                          {r.predictedRisk} ({r.score})
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {isEdit ? (
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => saveEdit(r)} aria-label="Save">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setEditing(null)} aria-label="Cancel">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => startEdit(r)} aria-label="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" aria-label="Delete">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this health record for {r.name || "this entry"}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => { remove(r._id); toast.success("Record deleted"); }}
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
