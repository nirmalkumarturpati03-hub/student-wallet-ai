import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useFinance";
import { useThemeStore } from "@/store/theme";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES } from "@/lib/currency";
import { toast } from "sonner";
import { Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const upd = useUpdateProfile(user?.id);
  const { theme, toggle } = useThemeStore();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Preferences and account management.</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 font-semibold">Preferences</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Currency</Label>
            <Select
              value={profile?.currency ?? "INR"}
              onValueChange={async (v) => { await upd.mutateAsync({ currency: v }); toast.success("Currency updated"); }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} — {c.symbol}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Theme</Label>
            <Button variant="outline" onClick={toggle} className="w-full justify-start">
              {theme === "dark" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
              {theme === "dark" ? "Dark" : "Light"} mode
            </Button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="mb-3 font-semibold">Account</h3>
        <p className="text-sm text-muted-foreground">Signed in as <span className="font-medium text-foreground">{user?.email}</span></p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
