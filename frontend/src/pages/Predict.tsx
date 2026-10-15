import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, Sparkles, Save, Info, HeartPulse, LogIn, Shield, Activity, Thermometer, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, LocationLabel } from "@/hooks/useLocation";
import { useNavigate } from "react-router-dom";
import { getCurrentAqi } from "@/services/openweather";
import { predictRisk, RISK_BG, type PredictionResult } from "@/lib/prediction";
import { useRecords } from "@/store/records";
import { useProfiles } from "@/store/profiles";
import { getAqiCategory } from "@/lib/aqi";
import { toast } from "sonner";
import { downloadHealthReport } from "@/lib/pdf";
import { useAuth } from "@/contexts/AuthContext";

const Schema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().int().min(1).max(120),
  hoursOutside: z.number().min(0).max(24),
});

const RECOMMENDATIONS: Record<string, string[]> = {
  Low: ["✅ Outdoor activities are safe.", "🌿 Stay hydrated and enjoy the fresh air.", "🏃 Exercise outdoors without concern."],
  Moderate: ["😷 Sensitive individuals should limit prolonged exertion.", "🪟 Ventilate your home.", "💧 Drink plenty of water."],
  High: ["⚠️ Reduce outdoor activity.", "🏠 Stay indoors; use air purifiers.", "😷 Wear an N95 mask outside.", "💊 Keep medication accessible."],
  Severe: ["🚨 Avoid ALL non-essential outdoor exposure.", "🏠 Keep windows shut.", "😷 Wear a respirator mask.", "🏥 Seek medical advice if needed."],
};

export default function Predict() {
  const [loc] = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profiles, addProfile } = useProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState<string>("new");
  const [saveAsProfile, setSaveAsProfile] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [asthma, setAsthma] = useState(false);
  const [allergies, setAllergies] = useState(false);
  const [maskType, setMaskType] = useState<string>("none");
  const [exerciseIntensity, setExerciseIntensity] = useState<string>("sedentary");
  const [diabetes, setDiabetes] = useState(false);
  const [heartDisease, setHeartDisease] = useState(false);
  const [hoursOutside, setHoursOutside] = useState(0);
  const [aqi, setAqi] = useState<number | null>(null);
  const [loadingAqi, setLoadingAqi] = useState(true);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const { add } = useRecords();

  useEffect(() => {
    setLoadingAqi(true);
    getCurrentAqi(loc.lat, loc.lon)
      .then((s) => setAqi(s.aqi))
      .catch(() => toast.error("Could not load current AQI"))
      .finally(() => setLoadingAqi(false));
  }, [loc.lat, loc.lon]);

  const handleProfileChange = (val: string) => {
    setSelectedProfileId(val);
    if (val === "new") {
      setName("");
      setAge("");
      setAsthma(false);
      setAllergies(false);
      setDiabetes(false);
      setHeartDisease(false);
      setSaveAsProfile(false);
    } else {
      const p = profiles.find((prof) => prof._id === val);
      if (p) {
        setName(p.name);
        setAge(p.age ? String(p.age) : "");
        setAsthma(!!p.asthma);
        setAllergies(!!p.allergies);
        setDiabetes(!!p.diabetes);
        setHeartDisease(!!p.heartDisease);
        setSaveAsProfile(false);
      }
    }
  };

  const onPredict = () => {
    const ageNum = Number(age);
    if (!name.trim()) return toast.error("Please enter your name");
    if (!age || isNaN(ageNum)) return toast.error("Please enter your age");
    const parsed = Schema.safeParse({ name: name.trim(), age: ageNum, hoursOutside });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (aqi == null) return toast.error("Waiting for AQI data");
    const res = predictRisk({
      age: ageNum,
      asthma,
      allergies,
      diabetes,
      heartDisease,
      maskType,
      exerciseIntensity,
      hoursOutside,
      aqi,
    });
    setResult(res);
  };

  const onSave = async () => {
    if (!result || aqi == null) return;
    if (!user) {
      navigate("/login", { state: { from: "/predict" } });
      return;
    }
    try {
      if (saveAsProfile && selectedProfileId === "new" && name.trim()) {
        try {
          await addProfile({
            name: name.trim(),
            age: Number(age) || null,
            asthma,
            allergies,
            diabetes,
            heartDisease,
          });
          toast.success("Saved new profile");
        } catch {
          // ignore duplicate profile error if any
        }
      }
      await add({
        name: name.trim() || null,
        age: Number(age),
        asthma,
        allergies,
        diabetes,
        heartDisease,
        maskType,
        exerciseIntensity,
        hoursOutside,
        aqi,
        location: `${loc.name}${loc.country ? ", " + loc.country : ""}`,
      });
      toast.success("Saved to your history");
    } catch { toast.error("Failed to save"); }
  };

  const onPDF = () => {
    if (!result || aqi == null) return;
    downloadHealthReport({
      location: `${loc.name}${loc.country ? ", " + loc.country : ""}`,
      aqi,
      aqiLabel: getAqiCategory(aqi).label,
      components: {},
      prediction: result,
      userName: name.trim() || user?.name,
    });
    toast.success("Report downloaded!");
  };

  return (
    <div className="container py-8 max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <HeartPulse className="h-7 w-7 text-primary" /> Health-risk prediction
        </h1>
        <p className="text-muted-foreground">Explainable engine · <LocationLabel loc={loc} /></p>
      </header>

      <Card className="p-6 sm:p-8 space-y-6 bg-gradient-card">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Profile picker & Name field */}
          <div className="sm:col-span-2 space-y-3">
            {user && profiles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="profile-select" className="flex items-center gap-1.5 font-medium">
                  <User className="h-4 w-4 text-primary" /> Select Saved Profile
                </Label>
                <Select value={selectedProfileId} onValueChange={handleProfileChange}>
                  <SelectTrigger id="profile-select">
                    <SelectValue placeholder="Choose a profile or custom entry" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name} {p.age ? `(Age ${p.age})` : ""}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">+ New profile / Custom entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(!user || selectedProfileId === "new" || profiles.length === 0) && (
              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  placeholder="Enter name (e.g. Sara, Dad, Self)"
                  onChange={(e) => setName(e.target.value)}
                />
                {user && (
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="saveProfile"
                      checked={saveAsProfile}
                      onCheckedChange={(checked) => setSaveAsProfile(!!checked)}
                    />
                    <Label htmlFor="saveProfile" className="text-xs text-muted-foreground cursor-pointer">
                      Save as reusable profile for future predictions
                    </Label>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age <span className="text-destructive">*</span></Label>
            <Input id="age" type="number" min={1} max={120} value={age} placeholder="Enter your age" onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Hours outside today: <span className="font-semibold">{hoursOutside}h</span></Label>
            <Slider value={[hoursOutside]} min={0} max={16} step={0.5} onValueChange={(v) => setHoursOutside(v[0])} />
          </div>

          {/* Mask Type & Exercise Intensity dropdowns */}
          <div className="space-y-2">
            <Label htmlFor="mask" className="flex items-center gap-1.5 font-medium">
              <Shield className="h-4 w-4 text-primary" /> Mask Protection
            </Label>
            <Select value={maskType} onValueChange={setMaskType}>
              <SelectTrigger id="mask">
                <SelectValue placeholder="Select mask protection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Mask (+0)</SelectItem>
                <SelectItem value="cloth">Cloth / Surgical Mask (Partial -5 pts)</SelectItem>
                <SelectItem value="n95">N95 / KN95 Respirator (Strong -15 pts)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise" className="flex items-center gap-1.5 font-medium">
              <Activity className="h-4 w-4 text-primary" /> Outdoor Activity Level
            </Label>
            <Select value={exerciseIntensity} onValueChange={setExerciseIntensity}>
              <SelectTrigger id="exercise">
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary / Walking (+0)</SelectItem>
                <SelectItem value="light">Light Activity (+3 pts)</SelectItem>
                <SelectItem value="moderate">Moderate Jogging/Cycling (+8 pts)</SelectItem>
                <SelectItem value="intense">Intense Exercise/Running (+15 pts)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 space-y-3">
            <Label className="text-base font-semibold">Health Conditions & Sensitivities</Label>
            {[
              { id: "asthma", label: "Asthma / Chronic Respiratory", sub: "Amplifies risk at higher AQI.", val: asthma, set: setAsthma },
              { id: "allergies", label: "Seasonal Allergies / Pollen Sensitivity", sub: "Increases mucosal sensitivity during poor air quality.", val: allergies, set: setAllergies },
              { id: "diabetes", label: "Diabetes", sub: "Increases cardiovascular sensitivity.", val: diabetes, set: setDiabetes },
              { id: "heart", label: "Heart Disease / Cardiovascular", sub: "PM2.5 and CO directly stress the heart.", val: heartDisease, set: setHeartDisease },
            ].map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-4">
                <div><Label htmlFor={c.id} className="text-sm font-medium">{c.label}</Label><p className="text-xs text-muted-foreground">{c.sub}</p></div>
                <Switch id={c.id} checked={c.val} onCheckedChange={c.set} />
              </div>
            ))}
          </div>
          <div className="rounded-lg border p-4 sm:col-span-2 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current AQI at {loc.name}</p>
              {loadingAqi ? <p className="text-xl font-semibold flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading…</p>
                : aqi != null ? <p className="text-3xl font-bold">{aqi}<span className="text-base text-muted-foreground"> /5 · {getAqiCategory(aqi).label}</span></p>
                : <p className="text-sm text-destructive">Unavailable</p>}
            </div>
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={onPredict} disabled={loadingAqi || aqi == null || !age} size="lg" className="bg-gradient-sky shadow-elegant">
            <Sparkles className="mr-2 h-4 w-4" /> Predict risk
          </Button>
          {result && <>
            <Button variant="outline" onClick={onSave} size="lg">
              {user ? <Save className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
              {user ? "Save" : "Login to Save"}
            </Button>
            <Button variant="outline" onClick={onPDF} size="lg">PDF Report</Button>
          </>}
        </div>
      </Card>

      {result && (
        <Card className="p-6 sm:p-8 animate-fade-in space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm text-muted-foreground">Predicted risk</p><p className="text-4xl font-bold mt-1">{result.level}</p></div>
            <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white ${RISK_BG[result.level]}`}>Score {result.score}/100</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-secondary">
            <div className={`h-full ${RISK_BG[result.level]} transition-smooth`} style={{ width: `${result.score}%` }} />
          </div>
          <div className="rounded-xl border bg-secondary/40 p-4">
            <p className="flex items-center gap-2 text-sm font-medium"><Info className="h-4 w-4 text-primary" /> Why this score?</p>
            <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground list-decimal pl-5">{result.reasons.map((r, i) => <li key={i}>{r}</li>)}</ol>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold mb-3">💡 Recommendations</p>
            <ul className="space-y-2">{RECOMMENDATIONS[result.level].map((rec, i) => <li key={i} className="text-sm text-muted-foreground">{rec}</li>)}</ul>
          </div>
        </Card>
      )}
    </div>
  );
}
