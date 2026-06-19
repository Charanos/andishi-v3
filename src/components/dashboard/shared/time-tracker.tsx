"use client";

import { useState } from "react";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";

export function TimeTracker() {
  const [running, setRunning] = useState(false);

  return (
    <div className="rounded-[1.15rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="label-caps text-[var(--secondary)]">Active timer</p>
          <p className="mt-4 font-mono text-[2.6rem] leading-none text-[var(--on-surface)]">
            {running ? "01:24:18" : "00:00:00"}
          </p>
          <p className="mt-3 text-[0.9rem] text-[var(--on-surface-dim)]">AI support workflow · Evaluation dashboard</p>
        </div>
        <button
          type="button"
          onClick={() => setRunning((value) => !value)}
          className="grid h-12 w-12 place-items-center rounded-full bg-[var(--on-surface)] text-[var(--bg)]"
          aria-label={running ? "Pause timer" : "Start timer"}
        >
          {running ? <IconPlayerPause size={20} stroke={1.8} /> : <IconPlayerPlay size={20} stroke={1.8} />}
        </button>
      </div>
    </div>
  );
}
