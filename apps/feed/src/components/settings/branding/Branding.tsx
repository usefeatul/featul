"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import PlanNotice from "../global/PlanNotice";
import { LoadingButton } from "@/components/global/loading-button";
import {
  loadBrandingBySlug,
  saveBranding,
  updateWorkspaceName,
} from "../../../lib/branding-service";
import { toast } from "sonner";
import { Switch } from "@feedgot/ui/components/switch";
import {
  BRANDING_COLORS,
  findColorByPrimary,
  applyBrandPrimary,
} from "../../../types/colors";
import ColorPicker from "./ColorPicker";
import ThemePicker from "./ThemePicker";
import LogoUploader from "./LogoUploader";
import LayoutStylePicker from "./LayoutStylePicker";
import SidebarPositionPicker from "./SidebarPositionPicker";
import { setWorkspaceLogo } from "@/lib/branding-store";
import { Input } from "@feedgot/ui/components/input";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@feedgot/api/client";
import { useCanEditBranding } from "@/hooks/useWorkspaceAccess";
import {  getPlanLimits } from "@/lib/plan";

export default function BrandingSection({ slug, initialHidePoweredBy }: { slug: string; initialHidePoweredBy?: boolean }) {
  const [logoUrl, setLogoUrl] = React.useState("");
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6");
  const [accentColor, setAccentColor] = React.useState("#60a5fa");
  const [colorKey, setColorKey] = React.useState<string>("blue");
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">(
    "system"
  );
  const [hidePoweredBy, setHidePoweredBy] = React.useState<boolean>(Boolean(initialHidePoweredBy));
  const [layoutStyle, setLayoutStyle] = React.useState<"compact" | "comfortable" | "spacious">("comfortable");
  const [sidebarPosition, setSidebarPosition] = React.useState<"left" | "right">("left");
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [workspaceName, setWorkspaceName] = React.useState("");
  const originalNameRef = React.useRef<string>("");
  const queryClient = useQueryClient();
  const [plan, setPlan] = React.useState<string>("free");
  const { loading: brandingAccessLoading, canEditBranding } = useCanEditBranding(slug);

  React.useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const conf = await loadBrandingBySlug(slug);
        if (mounted && conf) {
          setLogoUrl(conf.logoUrl || "");
          const currentPrimary = conf.primaryColor || "#3b82f6";
          const found =
            findColorByPrimary(currentPrimary) || BRANDING_COLORS[1];
          setPrimaryColor(currentPrimary);
          setAccentColor(
            conf.accentColor || (found && found.accent) || "#60a5fa"
          );
          setColorKey(found ? found.key : "blue");
          if (
            conf.theme === "light" ||
            conf.theme === "dark" ||
            conf.theme === "system"
          )
            setTheme(conf.theme);
          setHidePoweredBy(typeof initialHidePoweredBy === "boolean" ? Boolean(initialHidePoweredBy) : Boolean(conf.hidePoweredBy));
          if (
            conf.layoutStyle === "compact" ||
            conf.layoutStyle === "comfortable" ||
            conf.layoutStyle === "spacious"
          )
            setLayoutStyle(conf.layoutStyle);
          if (conf.sidebarPosition === "left" || conf.sidebarPosition === "right")
            setSidebarPosition(conf.sidebarPosition);
        }
        try {
          const res = await client.workspace.bySlug.$get({ slug });
          const d = await res.json();
          const w = (d as { workspace?: { name?: string; plan?: string } })
            ?.workspace;
          const n = String(w?.name || "");
          if (mounted) {
            setWorkspaceName(n);
            originalNameRef.current = n;
            setPlan(String(w?.plan || "free"));
          }
        } catch {}
        
      } catch (e) {
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleSave = async () => {
    if (saving) return;
    if (!canEditBranding) {
      toast.error("You don’t have permission to update branding");
      return;
    }
    setSaving(true);
    const root = document.documentElement;
    const prevP = getComputedStyle(root).getPropertyValue("--primary").trim();
    const p = primaryColor.trim();
    const limits = getPlanLimits(plan);
    const canBranding = limits.allowBranding === true;
    const canHidePoweredBy = limits.allowHidePoweredBy === true;
    if (canBranding) applyBrandPrimary(p);
    try {
      const nameChanged =
        workspaceName.trim() &&
        workspaceName.trim() !== originalNameRef.current;
      if (nameChanged) {
        const r = await updateWorkspaceName(slug, workspaceName.trim());
        if (!r.ok) throw new Error(r.message || "Update failed");
        originalNameRef.current = workspaceName.trim();
        try {
          queryClient.setQueryData(["workspace", slug], (prev: any) =>
            prev ? { ...prev, name: workspaceName.trim() } : prev
          );
          queryClient.setQueryData(["workspaces"], (prev: any) => {
            const list = Array.isArray(prev) ? prev : prev?.workspaces || [];
            const next = list.map((w: any) =>
              w?.slug === slug ? { ...w, name: workspaceName.trim() } : w
            );
            return prev && prev.workspaces
              ? { ...prev, workspaces: next }
              : next;
          });
        } catch {}
      }
      const brandingInput: any = {};
      if (canBranding) {
        if (logoUrl.trim()) brandingInput.logoUrl = logoUrl.trim();
        brandingInput.primaryColor = p;
      }
      brandingInput.theme = theme;
      brandingInput.layoutStyle = layoutStyle;
      brandingInput.sidebarPosition = sidebarPosition;
      if (canHidePoweredBy) brandingInput.hidePoweredBy = hidePoweredBy;
      const result = await saveBranding(slug, brandingInput);
      if (!result.ok) throw new Error(result.message || "Update failed");
      if (logoUrl.trim() && canBranding) {
        setWorkspaceLogo(slug, logoUrl.trim());
        try {
          queryClient.setQueryData(["workspace", slug], (prev: any) =>
            prev ? { ...prev, logo: logoUrl.trim() } : prev
          );
          queryClient.setQueryData(["workspaces"], (prev: any) => {
            const list = Array.isArray(prev) ? prev : prev?.workspaces || [];
            const next = list.map((w: any) =>
              w?.slug === slug ? { ...w, logo: logoUrl.trim() } : w
            );
            return prev && prev.workspaces ? { ...prev, workspaces: next } : next;
          });
        } catch {}
      }
      toast.success("Settings updated");
    } catch (e: any) {
      if (canBranding) applyBrandPrimary(prevP || "#3b82f6");
      toast.error(e?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Branding" description="Change your brand settings.">
      <div className="divide-y mt-2">
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Workspace Name</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <Input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="h-9 w-[220px] text-right"
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Logo</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <LogoUploader
              slug={slug}
              value={logoUrl}
              onChange={setLogoUrl}
              disabled={!getPlanLimits(plan).allowBranding || !canEditBranding}
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Primary Color</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <ColorPicker
              valueHex={primaryColor}
              onSelect={(c) => {
                setColorKey(c.key);
                setPrimaryColor(c.primary);
                setAccentColor(c.accent);
                applyBrandPrimary(c.primary);
              }}
              disabled={!getPlanLimits(plan).allowBranding || !canEditBranding}
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Theme</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <ThemePicker value={theme} onSelect={(t) => setTheme(t)} disabled={!canEditBranding} />
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Layout Style</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <LayoutStylePicker value={layoutStyle} onSelect={(l) => setLayoutStyle(l)} disabled={!canEditBranding} />
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="text-sm">Sidebar Position</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <SidebarPositionPicker value={sidebarPosition} onSelect={(p) => setSidebarPosition(p)} disabled={!canEditBranding} />
          </div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Hide "Powered by" Branding
          </div>
          <div className="w-full max-w-md flex items-center justify-end">
            <Switch
              checked={hidePoweredBy}
              onCheckedChange={(v) => setHidePoweredBy(Boolean(v))}
              aria-label="Hide Powered by"
              disabled={!getPlanLimits(plan).allowHidePoweredBy || !canEditBranding}
            />
          </div>
        </div>
      </div>
      <div className="p-4">
        <PlanNotice slug={slug} feature="branding" />
      </div>

      <div className="px-4 pb-4">
        <LoadingButton onClick={handleSave} loading={saving} disabled={loading || brandingAccessLoading || !canEditBranding}>
          Save
        </LoadingButton>
      </div>
    </SectionCard>
  );
}
