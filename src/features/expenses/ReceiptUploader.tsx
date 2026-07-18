import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { aiReceipt } from "@/lib/ai.functions";
import { useAddExpense } from "@/hooks/useFinance";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Parsed = { title?: string; amount?: number; category?: string; date?: string | null; description?: string };

export default function ReceiptUploader({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const { user } = useAuth();
  const add = useAddExpense(user?.id);
  const scan = useServerFn(aiReceipt);
  const [preview, setPreview] = useState<string>("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (f.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const url = reader.result as string;
      setPreview(url);
      const base64 = url.split(",")[1];
      setLoading(true);
      try {
        const res = await scan({ data: { imageBase64: base64, mimeType: f.type || "image/jpeg" } });
        setParsed(res.data ?? {});
        toast.success("Receipt scanned");
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Scan failed");
      } finally { setLoading(false); }
    };
    reader.readAsDataURL(f);
  };

  const save = async () => {
    if (!parsed?.title || !parsed?.amount) { toast.error("Missing title or amount"); return; }
    await add.mutateAsync({
      title: parsed.title, amount: Number(parsed.amount),
      category: parsed.category ?? "Others",
      date: parsed.date ?? new Date().toISOString().slice(0, 10),
      description: parsed.description ?? null,
    });
    toast.success("Expense added");
    reset();
    onOpenChange(false);
  };

  const reset = () => { setPreview(""); setParsed(null); setLoading(false); };

  return (
    <Dialog open={open} onOpenChange={(b) => { onOpenChange(b); if (!b) reset(); }}>
      <DialogContent className="glass-strong sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Scan receipt with AI</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {!preview ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 py-12 hover:bg-muted/50"
            >
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Click to upload receipt</span>
              <span className="text-xs text-muted-foreground">JPG or PNG, up to 5MB</span>
            </button>
          ) : (
            <div className="space-y-3">
              <img src={preview} alt="receipt" className="max-h-48 w-full rounded-xl object-contain" />
              {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Analyzing receipt…</div>}
              {parsed && (
                <div className="grid gap-2">
                  <div><Label>Title</Label><Input value={parsed.title ?? ""} onChange={(e) => setParsed({ ...parsed, title: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Amount</Label><Input type="number" value={parsed.amount ?? 0} onChange={(e) => setParsed({ ...parsed, amount: Number(e.target.value) })} /></div>
                    <div><Label>Category</Label><Input value={parsed.category ?? ""} onChange={(e) => setParsed({ ...parsed, category: e.target.value })} /></div>
                  </div>
                  <div><Label>Date</Label><Input type="date" value={parsed.date ?? ""} onChange={(e) => setParsed({ ...parsed, date: e.target.value })} /></div>
                </div>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
        <DialogFooter>
          {preview && <Button variant="ghost" onClick={reset}>Try another</Button>}
          <Button onClick={save} disabled={!parsed || loading} className="gradient-primary text-primary-foreground">Save expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
