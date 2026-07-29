"use client";

import CrudManager from "@/components/CrudManager";

const STATUS_STYLE: Record<string, string> = {
  live: "bg-emerald-500/20 text-emerald-300",
  upcoming: "bg-sky-500/20 text-sky-300",
  ended: "bg-white/10 text-white/50",
};

export default function EventsPage() {
  return (
    <CrudManager
      endpoint="/api/events"
      title="Events"
      icon="🎉"
      searchKey="title"
      defaults={{ title: "", description: "", icon: "🎉", status: "live" }}
      fields={[
        { name: "title", label: "Title", placeholder: "Weekend Frenzy" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "icon", label: "Icon (emoji)", placeholder: "🎉" },
        { name: "status", label: "Status", type: "select", options: ["live", "upcoming", "ended"] },
      ]}
      renderCard={(item, actions) => (
        <div key={item.id} className="glass rounded-2xl p-5 animate-fade-up flex flex-col">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{String(item.icon)}</span>
            <div className="flex-1">
              <h3 className="font-semibold">{String(item.title)}</h3>
            </div>
            <span className={`text-[10px] uppercase rounded-full px-2 py-0.5 ${STATUS_STYLE[String(item.status)] ?? ""}`}>
              {String(item.status)}
            </span>
          </div>
          <p className="text-sm text-white/50 mt-2 flex-1">{String(item.description)}</p>
          {actions && <div className="mt-3">{actions}</div>}
        </div>
      )}
    />
  );
}
