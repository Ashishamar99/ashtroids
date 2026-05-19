"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signalLogs } from "@/data/profile";

export default function SignalsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-space">
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(107,141,181,0.08) 0%, transparent 60%)",
        }}
      />

      <motion.div
        className="relative z-10 max-w-3xl mx-auto px-6 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back */}
        <motion.button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-mono text-xs group mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            &lt;-
          </span>
          <span>Return to orbit</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-mono text-accent-glow tracking-wider">
            // INTERCEPTED_TRANSMISSIONS
          </p>
          <h1 className="text-3xl font-bold mt-3">Signal Logs</h1>
          <p className="text-secondary mt-2">
            Thoughts, notes, and transmissions from deep space.
          </p>
        </motion.div>

        {/* Signal entries */}
        <div className="mt-10 space-y-6">
          {signalLogs.map((log, i) => (
            <motion.article
              key={log.id}
              className="p-6 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              {/* Meta bar */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-accent-glow">
                    {log.id}
                  </span>
                  <span className="text-[10px] font-mono text-secondary/40">
                    {log.date}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-terminal/60" />
                  <span className="text-[10px] font-mono text-secondary/40">
                    Signal: {log.signalStrength}%
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-lg font-semibold text-primary">
                {log.title}
              </h2>

              {/* Content */}
              <p className="text-sm text-primary/60 mt-3 leading-relaxed">
                {log.content}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {log.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-secondary/60 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-[10px] font-mono text-secondary/20">
            END OF TRANSMISSION LOG
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
