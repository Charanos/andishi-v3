"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AppearanceConfig = {
  sidebarTheme: "glass" | "solid" | "cosmic";
  topNavTheme: "transparent" | "glass" | "solid";
  primaryAccent: string;
  sidebarState: "expanded" | "collapsed";
  topBarState: "visible" | "hidden";
};

const defaultAppearance: AppearanceConfig = {
  sidebarTheme: "solid",
  topNavTheme: "glass",
  primaryAccent: "#6366f1", // default primary
  sidebarState: "expanded",
  topBarState: "visible",
};

type AppearanceContextType = {
  appearance: AppearanceConfig;
  updateAppearance: (key: keyof AppearanceConfig, value: string) => Promise<void>;
  /** Persist several fields as one batch - used by the Settings > Appearance "Save" action. */
  updateAppearanceBatch: (patch: Partial<AppearanceConfig>) => Promise<void>;
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

const settingKeyFor: Record<keyof AppearanceConfig, string> = {
  sidebarTheme: "theme:sidebar",
  topNavTheme: "theme:topnav",
  primaryAccent: "theme:accent",
  sidebarState: "layout:sidebar",
  topBarState: "layout:topbar",
};

async function persistSetting(key: keyof AppearanceConfig, value: string) {
  await fetch(`/api/settings/${encodeURIComponent(settingKeyFor[key])}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value), // save as JSON string literal
  });
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearance] = useState<AppearanceConfig>(defaultAppearance);

  useEffect(() => {
    // Load from DB settings API on mount
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          const settings = data.settings || [];
          const sidebarSetting = settings.find((s: { key: string; value: string }) => s.key === "theme:sidebar")?.value;
          const topnavSetting = settings.find((s: { key: string; value: string }) => s.key === "theme:topnav")?.value;
          const accentSetting = settings.find((s: { key: string; value: string }) => s.key === "theme:accent")?.value;
          const sidebarStateSetting = settings.find((s: { key: string; value: string }) => s.key === "layout:sidebar")?.value;
          const topbarStateSetting = settings.find((s: { key: string; value: string }) => s.key === "layout:topbar")?.value;

          setAppearance({
            sidebarTheme: sidebarSetting ? JSON.parse(sidebarSetting) : defaultAppearance.sidebarTheme,
            topNavTheme: topnavSetting ? JSON.parse(topnavSetting) : defaultAppearance.topNavTheme,
            primaryAccent: accentSetting ? JSON.parse(accentSetting) : defaultAppearance.primaryAccent,
            sidebarState: sidebarStateSetting ? JSON.parse(sidebarStateSetting) : defaultAppearance.sidebarState,
            topBarState: topbarStateSetting ? JSON.parse(topbarStateSetting) : defaultAppearance.topBarState,
          });
        }
      } catch (e) {
        console.error("Failed to load appearance settings", e);
      }
    };
    loadSettings();
  }, []);

  const updateAppearance = async (key: keyof AppearanceConfig, value: string) => {
    setAppearance((prev) => ({ ...prev, [key]: value }));
    try {
      await persistSetting(key, value);
    } catch (e) {
      console.error("Failed to save appearance setting", e);
    }
  };

  /** Applies + persists several fields together - used by the Appearance panel's "Save" button. */
  const updateAppearanceBatch = async (patch: Partial<AppearanceConfig>) => {
    const entries = Object.entries(patch) as Array<[keyof AppearanceConfig, string]>;
    if (entries.length === 0) return;

    setAppearance((prev) => ({ ...prev, ...patch }));
    await Promise.all(entries.map(([key, value]) => persistSetting(key, value)));
  };

  return (
    <AppearanceContext.Provider value={{ appearance, updateAppearance, updateAppearanceBatch }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
}

/**
 * WCAG relative-luminance check so a picked accent always gets a readable
 * "on" color, instead of leaving --on-primary fixed to the theme default
 * (which can end up low-contrast against an arbitrary user-picked hex).
 */
export function contrastOnColor(hex: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return "#ffffff";
  const channels = [0, 1, 2].map((i) => {
    const value = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.5 ? "#160B2F" : "#ffffff";
}
