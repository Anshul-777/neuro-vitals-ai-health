import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/context/AnalysisContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle } from "lucide-react";

const IntakeFormPage = () => {
  const navigate = useNavigate();
  const { setProfile, setSelectedModules } = useAnalysis();
  const [form, setForm] = useState({
    name: "",
    age: "",
    sex: "",
    height: "",
    weight: "",
    dominantHand: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.age || +form.age < 1 || +form.age > 120)
      e.age = "Valid age required (1-120)";
    if (!form.sex) e.sex = "Required";
    if (!form.height || +form.height < 50 || +form.height > 300)
      e.height = "Valid height in cm";
    if (!form.weight || +form.weight < 10 || +form.weight > 500)
      e.weight = "Valid weight in kg";
    if (!form.dominantHand) e.dominantHand = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setProfile({
      name: form.name,
      age: +form.age,
      sex: form.sex,
      height: +form.height,
      weight: +form.weight,
      dominantHand: form.dominantHand,
    });
    setSelectedModules(["face_scan", "body_scan", "voice_scan", "3d_face"]);
    navigate("/test-selection");
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs font-mono text-muted-foreground">
            MEDICAL INTAKE
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Patient Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete the intake form before analysis. All fields are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                Full Name
              </Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Enter full name"
                className="bg-card border-border/50"
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                Age
              </Label>
              <Input
                type="number"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                placeholder="Years"
                className="bg-card border-border/50"
              />
              {errors.age && (
                <p className="text-xs text-destructive mt-1">{errors.age}</p>
              )}
            </div>

            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                Biological Sex
              </Label>
              <Select
                value={form.sex}
                onValueChange={(v) => update("sex", v)}
              >
                <SelectTrigger className="bg-card border-border/50">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.sex && (
                <p className="text-xs text-destructive mt-1">{errors.sex}</p>
              )}
            </div>

            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                Height (cm)
              </Label>
              <Input
                type="number"
                value={form.height}
                onChange={(e) => update("height", e.target.value)}
                placeholder="cm"
                className="bg-card border-border/50"
              />
              {errors.height && (
                <p className="text-xs text-destructive mt-1">
                  {errors.height}
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                Weight (kg)
              </Label>
              <Input
                type="number"
                value={form.weight}
                onChange={(e) => update("weight", e.target.value)}
                placeholder="kg"
                className="bg-card border-border/50"
              />
              {errors.weight && (
                <p className="text-xs text-destructive mt-1">
                  {errors.weight}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                Dominant Hand
              </Label>
              <Select
                value={form.dominantHand}
                onValueChange={(v) => update("dominantHand", v)}
              >
                <SelectTrigger className="bg-card border-border/50">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="ambidextrous">Ambidextrous</SelectItem>
                </SelectContent>
              </Select>
              {errors.dominantHand && (
                <p className="text-xs text-destructive mt-1">
                  {errors.dominantHand}
                </p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-border/30">
            <Button
              type="submit"
              size="lg"
              className="w-full font-mono tracking-wider h-12"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              CONFIRM PROFILE
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default IntakeFormPage;
