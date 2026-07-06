"use client";

import { useState, useEffect, useRef } from "react";
import {
  IconArrowLeft,
  IconLifebuoy,
  IconMessageCircle,
  IconSend,
  IconX,
  IconUsers,
  IconShield,
  IconFlame,
  type Icon,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { pinnedChats } from "@/data/dashboard";
import type { AuthUser } from "@/types/auth";
import { cosmicSpring, containerVariants, itemVariants } from "@/lib/motion";

type Message = {
  author: string;
  role: string;
  message: string;
  time: string;
  isSelf?: boolean;
};

type Thread = {
  id: string;
  name: string;
  avatar: string;
  type: "support" | "project" | "team";
  icon: Icon;
  color: string;
  messages: Message[];
};

export function FloatingSupportChat({
  user,
  activeChatId,
  setActiveChatId,
  open,
  setOpen,
}: {
  user: AuthUser;
  activeChatId: string | null;
  setActiveChatId: (chatId: string | null) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (open && chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  const [threads, setThreads] = useState<Record<string, Thread>>(() => {
    const supportInfo = pinnedChats.find(c => c.id === "chat-support")!;
    const projectInfo = pinnedChats.find(c => c.id === "chat-project")!;
    const teamInfo = pinnedChats.find(c => c.id === "chat-team")!;

    return {
      "chat-support": {
        id: "chat-support",
        name: supportInfo.name,
        avatar: supportInfo.avatar,
        type: "support",
        icon: IconShield,
        color: supportInfo.colorText || "text-[var(--tertiary)]",
        messages: [
          {
            author: "System Support",
            role: "Superadmin Resolver",
            message: "Welcome to Andishi Support. An admin support resolver is active. Tell us if you need help with scoping briefs, client permissions, or active billing invoices.",
            time: "10:00 AM",
          },
        ],
      },
      "chat-project": {
        id: "chat-project",
        name: projectInfo.name,
        avatar: projectInfo.avatar,
        type: "project",
        icon: IconFlame,
        color: projectInfo.colorText || "text-[var(--secondary)]",
        messages: [
          {
            author: "Amina Otieno",
            role: "Lead Architect",
            message: "Hi everyone, I have initialized the Docker setup and pushed the base Drizzle configurations to the dev branch.",
            time: "Yesterday",
          },
          {
            author: "Maya Kijani",
            role: "Client Stakeholder",
            message: "Awesome Amina! Can we schedule a brief walk-through of the auth and roles flow this Thursday?",
            time: "11:30 AM",
          },
          {
            author: "Dennis Mwangi",
            role: "Admin Manager",
            message: "Agreed. I'll block a 30-min slot on our schedules. Let's make sure the M-Pesa sandbox keys are verified in the config.",
            time: "12:15 PM",
          },
        ],
      },
      "chat-team": {
        id: "chat-team",
        name: teamInfo.name,
        avatar: teamInfo.avatar,
        type: "team",
        icon: IconUsers,
        color: teamInfo.colorText || "text-[var(--primary)]",
        messages: [
          {
            author: "Dennis Mwangi",
            role: "Admin Manager",
            message: "Quick update: Invoice AND-2026-0001 has been issued to Kijani and they've acknowledged processing on their end.",
            time: "Yesterday",
          },
          {
            author: "Amina Otieno",
            role: "Lead Architect",
            message: "Great. I'll finalize the payments ledger reconciliation script mapping today.",
            time: "09:15 AM",
          },
        ],
      },
    };
  });

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [open, activeChatId, threads]);

  const activeThread = activeChatId ? threads[activeChatId] : null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !activeChatId) return;

    const selfMsg: Message = {
      author: user.name,
      role: user.role === "admin" ? "Superadmin" : user.role === "client" ? "Stakeholder" : "Lead Builder",
      message: body,
      time: "Now",
      isSelf: true,
    };

    setThreads((current) => {
      const thread = current[activeChatId];
      return {
        ...current,
        [activeChatId]: {
          ...thread,
          messages: [...thread.messages, selfMsg],
        },
      };
    });
    setDraft("");

    setTimeout(() => {
      let replyMsg: Message;
      if (activeChatId === "chat-support") {
        replyMsg = {
          author: "System Support",
          role: "Resolver Bot",
          message: "Message received. Your support ticket context has been flagged for superadmin review. We will notify you here.",
          time: "Now",
        };
      } else if (activeChatId === "chat-project") {
        replyMsg = {
          author: "Amina Otieno",
          role: "Lead Architect",
          message: "Received! Let me check the config logs in Vercel and I'll drop an update back in this project thread.",
          time: "Now",
        };
      } else {
        replyMsg = {
          author: "Dennis Mwangi",
          role: "Admin Manager",
          message: "Got it team. Logging this under the active Sprint milestones so it doesn't fall off the radar.",
          time: "Now",
        };
      }

      setThreads((current) => {
        const thread = current[activeChatId];
        return {
          ...current,
          [activeChatId]: {
            ...thread,
            messages: [...thread.messages, replyMsg],
          },
        };
      });
    }, 1500);
  };

  return (
    <div ref={chatContainerRef} className="fixed bottom-24 right-4 z-50 lg:bottom-12 lg:right-8 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(4px)" }}
            transition={cosmicSpring}
            className="mb-4 w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_65%,transparent)] shadow-[0_12px_40px_-12px_color-mix(in_srgb,var(--bg-deep)_50%,transparent)] backdrop-blur-[40px] pointer-events-auto"
          >
            <AnimatePresence mode="wait">
              {activeThread ? (
                <motion.div
                  key="chat-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ ...cosmicSpring, duration: 0.35 }}
                  className="flex flex-col h-full"
                >
                  <div className="flex items-center gap-3 border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-elevated)_20%,transparent)] px-4 py-3.5">
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "var(--surface-elevated)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveChatId(null)}
                      className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200"
                    >
                      <IconArrowLeft size={15} stroke={1.5} />
                    </motion.button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={activeThread.avatar}
                            alt={activeThread.name}
                            className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-[var(--glass-border)] opacity-90"
                          />
                          <span className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ring-[1.5px] ring-[var(--surface-elevated)]", 
                            activeThread.id === "chat-support" ? "bg-[var(--tertiary)]" : activeThread.id === "chat-project" ? "bg-[var(--secondary)]" : "bg-[var(--primary)]"
                          )} />
                        </div>
                        <p className="truncate text-[0.9rem] font-medium text-[var(--on-surface)] tracking-wide">
                          {activeThread.name}
                        </p>
                      </div>
                      <p className="mt-0.5 text-[0.68rem] uppercase tracking-widest text-[var(--on-surface-dim)] opacity-70">
                        {activeThread.type} context
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "var(--surface-elevated)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setOpen(false)}
                      className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200"
                    >
                      <IconX size={15} stroke={1.5} />
                    </motion.button>
                  </div>
                  
                  <div className="flex flex-col h-[28rem]">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
                      {activeThread.messages.map((message, index) => {
                        const isSelf = message.isSelf || message.author === user.name;
                        const isSystemSupport = message.author === "System Support";

                        return (
                          <motion.article
                            key={`${message.time}-${index}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...cosmicSpring, delay: index * 0.04 }}
                            className={cn(
                              "max-w-[85%] break-words rounded-[1.1rem] border px-3.5 py-2.5",
                              isSelf
                                ? "ml-auto border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--on-surface)_8%,transparent)] text-[var(--on-surface)]"
                                : isSystemSupport
                                  ? "mr-auto border-[color-mix(in_srgb,var(--tertiary)_40%,transparent)] bg-[color-mix(in_srgb,var(--tertiary)_10%,transparent)] text-[var(--on-surface)] shadow-[0_0_20px_-5px_color-mix(in_srgb,var(--tertiary)_20%,transparent)]"
                                  : "mr-auto border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-elevated)_30%,transparent)] text-[var(--on-surface)]",
                            )}
                          >
                            <div className="flex items-baseline justify-between gap-3">
                              <p className={cn(
                                "text-[0.75rem] font-medium opacity-90",
                                isSelf ? "text-[var(--on-surface)]" : "text-[var(--on-surface)]"
                              )}>
                                {message.author}
                              </p>
                              <span className="font-mono text-[0.6rem] opacity-50 shrink-0">
                                {message.time}
                              </span>
                            </div>
                            <p className={cn(
                              "mt-0.5 text-[0.58rem] uppercase tracking-[0.1em] opacity-80",
                              isSelf 
                                ? "text-[var(--secondary)]" 
                                : isSystemSupport 
                                  ? "text-[var(--tertiary)]" 
                                  : "text-[var(--on-surface-dim)]"
                            )}>
                              {message.role}
                            </p>
                            <p className="mt-1.5 text-[0.82rem] leading-relaxed opacity-85">
                              {message.message}
                            </p>
                          </motion.article>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    <form
                      className="border-t border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] p-3.5"
                      onSubmit={handleSendMessage}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="Type your message..."
                          className="h-11 min-w-0 flex-1 rounded-full border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-elevated)_30%,transparent)] px-5 text-[0.88rem] text-[var(--on-surface)] outline-none placeholder:text-[var(--on-surface-dim)] focus:border-[color-mix(in_srgb,var(--secondary)_50%,transparent)] transition-all duration-300"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          disabled={!draft.trim()}
                          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-[var(--on-surface)] text-[var(--bg)] disabled:scale-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <IconSend size={18} stroke={1.5} className="ml-0.5" />
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ ...cosmicSpring, duration: 0.35 }}
                  className="flex flex-col h-full"
                >
                  <div className="flex items-center justify-between border-b border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--surface-elevated)_20%,transparent)] px-5 py-4">
                    <div>
                      <p className="text-[1rem] font-medium text-[var(--on-surface)] tracking-wide">
                        Communications
                      </p>
                      <p className="mt-0.5 text-[0.75rem] text-[var(--on-surface-dim)] opacity-80">
                        Active channels and support threads.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "var(--surface-elevated)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setOpen(false)}
                      className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-[var(--glass-border)] text-[var(--on-surface-dim)] transition-colors duration-200"
                    >
                      <IconX size={15} stroke={1.5} />
                    </motion.button>
                  </div>

                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col p-2 min-h-[20rem] max-h-[28rem] overflow-y-auto overflow-x-hidden"
                  >
                    {Object.values(threads).map((thread) => (
                      <motion.button
                        variants={itemVariants}
                        key={thread.id}
                        onClick={() => setActiveChatId(thread.id)}
                        className="group relative flex cursor-pointer items-start gap-3.5 rounded-[1rem] border border-transparent p-3 text-left transition-all duration-300 hover:border-[var(--glass-border)] hover:bg-[color-mix(in_srgb,var(--surface-elevated)_40%,transparent)]"
                      >
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thread.avatar}
                            alt={thread.name}
                            className="h-9 w-9 rounded-full object-cover ring-1 ring-[var(--glass-border)] opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                          />
                          <span className={cn(
                            "absolute bottom-0 right-0 h-2 w-2 rounded-full ring-2 ring-[var(--surface)]", 
                            thread.id === "chat-support" ? "bg-[var(--tertiary)]" : thread.id === "chat-project" ? "bg-[var(--secondary)]" : "bg-[var(--primary)]"
                          )} />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[0.88rem] font-medium text-[var(--on-surface)] transition-colors duration-200 group-hover:text-[var(--secondary)]">
                              {thread.name}
                            </p>
                            {thread.id === "chat-team" && (
                              <span className="grid h-4.5 min-w-[1.125rem] place-items-center rounded-full bg-[var(--tertiary)] px-1.5 font-mono text-[0.6rem] font-medium text-[var(--bg-deep)]">
                                2
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-[0.78rem] text-[var(--on-surface-dim)] transition-colors opacity-80 group-hover:opacity-100">
                            {thread.messages[thread.messages.length - 1]?.message}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(!open)}
        className="relative grid h-12 w-12 cursor-pointer place-items-center rounded-full border border-[color-mix(in_srgb,var(--glass-border)_60%,transparent)] bg-[var(--on-surface)] text-[var(--bg)] shadow-[0_8px_20px_-6px_color-mix(in_srgb,var(--bg-deep)_50%,transparent)] pointer-events-auto"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <IconX size={20} stroke={1.5} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <IconMessageCircle size={20} stroke={1.5} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!open && (
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
            className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full border-[1.5px] border-[var(--bg)] bg-[var(--tertiary)] text-[var(--bg-deep)] shadow-[0_0_8px_color-mix(in_srgb,var(--tertiary)_40%,transparent)]"
          >
            <IconLifebuoy size={10} stroke={2} />
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}


