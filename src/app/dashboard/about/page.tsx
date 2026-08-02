"use client";

import { useToast } from "@/components/Toast";

export default function AboutCreatorPage() {
  const { push } = useToast();

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText("mir_masum");
    push("Discord ID 'mir_masum' copied to clipboard! 🎮", "success");
  };

  const techStack = [
    { name: "Next.js 16", color: "bg-black text-white border-white/20" },
    { name: "React 19", color: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
    { name: "Tailwind CSS v4", color: "bg-sky-500/10 text-sky-300 border-sky-500/20" },
    { name: "PostgreSQL", color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" },
    { name: "Drizzle ORM", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
    { name: "TypeScript 5.9", color: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" },
    { name: "Jose JWT", color: "bg-violet-500/10 text-violet-300 border-violet-500/20" },
    { name: "Bcrypt Hashing", color: "bg-rose-500/10 text-rose-300 border-rose-500/20" },
  ];

  const socialLinks = [
    {
      name: "X (Twitter)",
      handle: "@mirmdamasum",
      url: "https://x.com/mirmdamasum",
      color: "hover:border-sky-400/40 hover:bg-sky-500/5 hover:text-sky-300",
      svg: (
        <svg className="w-5 h-5 fill-current mb-1.5" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 3.779 8.502 11.24H16.17l-5.214-6.817L4.99 17.25H1.68l7.73-4.041L1.25 2.25h6.963l4.73 6.255zm-1.161 13.02h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      handle: "mirmasum",
      url: "https://linkedin.com/in/mirmasum",
      color: "hover:border-blue-400/40 hover:bg-blue-500/5 hover:text-blue-300",
      svg: (
        <svg className="w-5 h-5 fill-current mb-1.5" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      handle: "@mirmd_masum",
      url: "https://instagram.com/mirmd_masum",
      color: "hover:border-pink-400/40 hover:bg-pink-500/5 hover:text-pink-300",
      svg: (
        <svg className="w-5 h-5 fill-current mb-1.5" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-black text-white">👨‍💻 About The Creator</h1>
        <p className="text-white/50 text-sm mt-1">
          Meet the software architect behind the Puzzle Universe platform.
        </p>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Left Side: Avatar Card */}
        <div className="glass-strong rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden animate-fade-up">
          {/* Decorative Back Light */}
          <div className="absolute top-[-30px] w-32 h-32 rounded-full bg-violet-500/20 blur-2xl pointer-events-none" />

          {/* Profile Image with Pulsing Outer Rings */}
          <div className="relative w-36 h-36 rounded-full p-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-xl shadow-violet-500/10 group">
            <div className="absolute inset-0 rounded-full border-2 border-fuchsia-400/20 animate-ping pointer-events-none" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://pbs.twimg.com/profile_images/2045439954629849088/9jL1-cqa.jpg"
              alt="Mir Md. Masum"
              className="w-full h-full object-cover rounded-full transition duration-300 group-hover:scale-105"
            />
          </div>

          <h2 className="text-xl font-black text-white mt-4 leading-tight">Mir Md. Masum</h2>
          <p className="text-xs text-violet-300 font-bold tracking-wide uppercase mt-1">
            Lead Software Architect
          </p>

          {/* Tagline Badges */}
          <div className="flex flex-wrap gap-1.5 justify-center mt-4">
            <span className="text-[10px] font-bold rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-white/70">
              🚀 Full-Stack
            </span>
            <span className="text-[10px] font-bold rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-white/70">
              🧠 Game Dev
            </span>
            <span className="text-[10px] font-bold rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-white/70">
              🎨 UI/UX Design
            </span>
          </div>

          {/* Quick Contacts */}
          <div className="w-full border-t border-white/5 mt-5 pt-4 space-y-2.5">
            <a
              href="mailto:mirmasum@mail.com"
              className="w-full rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2.5 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-2 justify-center transition"
            >
              {/* Mail SVG Icon */}
              <svg className="w-4 h-4 fill-current mr-2" viewBox="0 0 24 24">
                <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67z M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908z" />
              </svg>
              mirmasum@mail.com
            </a>

            <button
              onClick={handleCopyDiscord}
              className="w-full rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-4 py-2.5 text-xs font-semibold text-violet-300 flex items-center gap-2 justify-center transition active:scale-95"
            >
              {/* Discord SVG Icon */}
              <svg className="w-4 h-4 fill-current mr-2" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.074 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.73 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.075 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.075 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
              </svg>
              Discord: mir_masum
            </button>
          </div>
        </div>

        {/* Right Side: Creative Info, Stats & Skills */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="glass rounded-3xl p-6 sm:p-8 space-y-4 animate-fade-up">
            <h3 className="text-lg font-black text-white">🌟 Developer Brief</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Hi, I&apos;m **Mir Md. Masum**, a passionate Full-Stack Engineer and game logic designer.
              I design, build, and deploy commercial-grade platforms that marry robust, type-safe database architectures with breathtaking, fluid frontend interfaces.
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              **Puzzle Universe** represents a modular, scalable portfolio sandbox showcasing performance-optimized Next.js route handling, responsive scale-independent SVG layouts, robust JWT authentication, and secure, transaction-safe database claims pipelines.
            </p>
          </div>

          {/* Developer Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
            <StatCard icon="💻" label="Lines Written" value="15,000+" />
            <StatCard icon="☕" label="Coffee Brews" value="120+ Liters" />
            <StatCard icon="🐛" label="Bugs Obliterated" value="450+" />
            <StatCard icon="🎮" label="Games Completed" value="11 Complete" />
          </div>

          {/* Technologies badge cloud */}
          <div className="glass rounded-3xl p-6 space-y-4 animate-fade-up">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              🛠️ Platform Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech.name}
                  className={`text-xs font-bold border rounded-xl px-3 py-1.5 transition-all duration-200 hover:scale-105 ${tech.color}`}
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>

          {/* Social Links Connect Grid */}
          <div className="glass rounded-3xl p-6 space-y-4 animate-fade-up">
            <h3 className="text-lg font-black text-white">🔗 Social Connections</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-2xl bg-white/[0.03] border border-white/5 p-4 flex flex-col items-center text-center transition-all duration-300 ${link.color}`}
                >
                  {link.svg}
                  <span className="font-extrabold text-xs">{link.name}</span>
                  <span className="text-[10px] text-white/40 mt-1">{link.handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3 border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-200">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">
          {label}
        </div>
        <div className="text-base font-black text-white leading-none">{value}</div>
      </div>
    </div>
  );
}
