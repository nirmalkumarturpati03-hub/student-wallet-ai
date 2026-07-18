import { useAuth } from "@/hooks/useAuth";
import { useNotifications, useMarkNotifRead } from "@/hooks/useFinance";
import { Bell, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifs = [] } = useNotifications(user?.id);
  const mark = useMarkNotifRead(user?.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Notifications</h1>
        <p className="text-sm text-muted-foreground">Reminders and insights from your wallet.</p>
      </div>

      <div className="glass rounded-2xl">
        {notifs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-muted"><Bell className="h-6 w-6 text-muted-foreground" /></div>
            <p className="text-muted-foreground">You're all caught up.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifs.map((n) => (
              <li key={n.id} className={`flex items-start gap-3 p-4 ${n.read ? "opacity-60" : ""}`}>
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Bell className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{n.title}</div>
                  {n.body && <div className="text-sm text-muted-foreground">{n.body}</div>}
                  <div className="mt-1 text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</div>
                </div>
                {!n.read && (
                  <button onClick={() => mark.mutate(n.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Mark read">
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
