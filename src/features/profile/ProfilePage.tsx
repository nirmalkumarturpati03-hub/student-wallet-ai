import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useFinance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const upd = useUpdateProfile(user?.id);
  const [form, setForm] = useState({ full_name: "", college: "", course: "", year_of_study: "" });

  useEffect(() => {
    if (profile) setForm({
      full_name: profile.full_name ?? "",
      college: profile.college ?? "",
      course: profile.course ?? "",
      year_of_study: profile.year_of_study ? String(profile.year_of_study) : "",
    });
  }, [profile]);

  const save = async () => {
    await upd.mutateAsync({
      full_name: form.full_name || null,
      college: form.college || null,
      course: form.course || null,
      year_of_study: form.year_of_study ? Number(form.year_of_study) : null,
    });
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Profile</h1>
        <p className="text-sm text-muted-foreground">Personalize your Student Wallet experience.</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow"><User className="h-8 w-8" /></div>
          <div>
            <div className="text-lg font-bold">{profile?.full_name || "New student"}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><Label>College</Label><Input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="IIT Bombay" /></div>
          <div><Label>Course</Label><Input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} placeholder="B.Tech CSE" /></div>
          <div><Label>Year of study</Label><Input type="number" min={1} max={6} value={form.year_of_study} onChange={(e) => setForm({ ...form, year_of_study: e.target.value })} /></div>
        </div>
        <Button onClick={save} className="mt-4 gradient-primary text-primary-foreground">Save changes</Button>
      </div>
    </div>
  );
}
