import { Tag, ExternalLink } from "lucide-react";

const DISCOUNTS = [
  { name: "Spotify Student", desc: "50% off Premium + Hulu bundle", url: "https://www.spotify.com/student/", tag: "Music" },
  { name: "Amazon Prime Student", desc: "6-month free trial, then 50% off", url: "https://www.amazon.com/joinstudent", tag: "Shopping" },
  { name: "Apple Education", desc: "Discounts on Mac, iPad + free AirPods", url: "https://www.apple.com/education/", tag: "Tech" },
  { name: "Microsoft 365 Education", desc: "Free Office 365 with school email", url: "https://www.microsoft.com/education/products/office", tag: "Software" },
  { name: "GitHub Student Pack", desc: "Free premium developer tools", url: "https://education.github.com/pack", tag: "Developer" },
  { name: "Notion for Education", desc: "Free Notion Plus with student email", url: "https://www.notion.so/students", tag: "Productivity" },
  { name: "Adobe Creative Cloud", desc: "60%+ off All Apps plan", url: "https://www.adobe.com/creativecloud/buy/students.html", tag: "Design" },
  { name: "YouTube Premium Student", desc: "Half-price monthly", url: "https://www.youtube.com/premium/student", tag: "Video" },
  { name: "Zomato / Swiggy Coupons", desc: "Student food delivery deals", url: "https://www.zomato.com/offers", tag: "Food" },
  { name: "Unidays", desc: "Aggregator of 100+ student offers", url: "https://www.myunidays.com/", tag: "Deals" },
];

export default function DiscountsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">Student Discounts</h1>
        <p className="text-sm text-muted-foreground">Curated deals every student should claim.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DISCOUNTS.map((d) => (
          <a key={d.name} href={d.url} target="_blank" rel="noreferrer" className="glass rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-glow">
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
              <Tag className="h-3 w-3" /> {d.tag}
            </div>
            <h3 className="font-bold">{d.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">Claim <ExternalLink className="h-3 w-3" /></span>
          </a>
        ))}
      </div>
    </div>
  );
}
