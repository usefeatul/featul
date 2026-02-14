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
import { Switch } from "@featul/ui/components/switch";
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
import { Input } from "@featul/ui/components/input";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { useCanEditBranding } from "@/hooks/useWorkspaceAccess";
import { getPlanLimits, normalizePlan, type PlanKey } from "@/lib/plan";
import type { BrandingConfig } from "../../../types/branding";
import { updateWorkspaceLogoInCache, updateWorkspaceNameInCache } from "./branding-cache";

interface BrandingSectionProps {
  slug: string;
  initialHidePoweredBy?: boolean;
  initialPlan?: string;
  initialConfig?: BrandingConfig | null;
  initialWorkspaceName?: string;
}

export default function BrandingSection({
  slug,
  initialHidePoweredBy,
  initialPlan,
  initialConfig,
  initialWorkspaceName,
}: BrandingSectionProps) {
  const initialPrimary = initialConfig?.primaryColor || "#3b82f6";
  const initialFound = findColorByPrimary(initialPrimary) || BRANDING_COLORS[1];
  const [logoUrl, setLogoUrl] = React.useState(String(initialConfig?.logoUrl || ""));
  const [primaryColor, setPrimaryColor] = React.useState(initialPrimary);
  const [accentColor, setAccentColor] = React.useState(
    String(initialConfig?.accentColor || (initialFound && initialFound.accent) || "#60a5fa"),
  );
  const [colorKey, setColorKey] = React.useState<string>(initialFound ? initialFound.key : "blue");
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">(
    initialConfig?.theme === "light" || initialConfig?.theme === "dark" || initialConfig?.theme === "system"
      ? initialConfig.theme
      : "system",
  );
  const [hidePoweredBy, setHidePoweredBy] = React.useState<boolean>(
    typeof initialHidePoweredBy === "boolean" ? Boolean(initialHidePoweredBy) : Boolean(initialConfig?.hidePoweredBy),
  );
  const [layoutStyle, setLayoutStyle] = React.useState<"compact" | "comfortable" | "spacious">(
    initialConfig?.layoutStyle === "compact" ||
      initialConfig?.layoutStyle === "comfortable" ||
      initialConfig?.layoutStyle === "spacious"
      ? initialConfig.layoutStyle
      : "comfortable",
  );
  const [sidebarPosition, setSidebarPosition] = React.useState<"left" | "right">(
    initialConfig?.sidebarPosition === "left" || initialConfig?.sidebarPosition === "right"
      ? initialConfig.sidebarPosition
      : "left",
  );
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(!initialConfig);
  const [workspaceName, setWorkspaceName] = React.useState(String(initialWorkspaceName || ""));
  const originalNameRef = React.useRef<string>(String(initialWorkspaceName || ""));
  const queryClient = useQueryClient();
  const [plan, setPlan] = React.useState<PlanKey>(normalizePlan(initialPlan || "free"));
  const { loading: brandingAccessLoading, canEditBranding } = useCanEditBranding(slug);

  React.useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const conf0 = initialConfig || null;
        if (mounted && conf0) {
          setLogoUrl(conf0.logoUrl || "");
          const currentPrimary = conf0.primaryColor || "#3b82f6";
          const found = findColorByPrimary(currentPrimary) || BRANDING_COLORS[1];
          setPrimaryColor(currentPrimary);
          setAccentColor(conf0.accentColor || (found && found.accent) || "#60a5fa");
          setColorKey(found ? found.key : "blue");
          if (conf0.theme === "light" || conf0.theme === "dark" || conf0.theme === "system") setTheme(conf0.theme);
          setHidePoweredBy(
            typeof initialHidePoweredBy === "boolean"
              ? Boolean(initialHidePoweredBy)
              : Boolean(conf0.hidePoweredBy),
          );
          if (
            conf0.layoutStyle === "compact" ||
            conf0.layoutStyle === "comfortable" ||
            conf0.layoutStyle === "spacious"
          ) {
            setLayoutStyle(conf0.layoutStyle);
          }
          if (conf0.sidebarPosition === "left" || conf0.sidebarPosition === "right") {
            setSidebarPosition(conf0.sidebarPosition);
          }
        } else {
          const conf = await loadBrandingBySlug(slug);
          if (mounted && conf) {
            setLogoUrl(conf.logoUrl || "");
            const currentPrimary = conf.primaryColor || "#3b82f6";
            const found = findColorByPrimary(currentPrimary) || BRANDING_COLORS[1];
            setPrimaryColor(currentPrimary);
            setAccentColor(conf.accentColor || (found && found.accent) || "#60a5fa");
            setColorKey(found ? found.key : "blue");
            if (conf.theme === "light" || conf.theme === "dark" || conf.theme === "system") setTheme(conf.theme);
            setHidePoweredBy(
              typeof initialHidePoweredBy === "boolean"
                ? Boolean(initialHidePoweredBy)
                : Boolean(conf.hidePoweredBy),
            );
            if (
              conf.layoutStyle === "compact" ||
              conf.layoutStyle === "comfortable" ||
              conf.layoutStyle === "spacious"
            ) {
              setLayoutStyle(conf.layoutStyle);
            }
            if (conf.sidebarPosition === "left" || conf.sidebarPosition === "right") {
              setSidebarPosition(conf.sidebarPosition);
            }
          }
        }
        if (typeof initialWorkspaceName === "string" && initialWorkspaceName) {
          const n = String(initialWorkspaceName || "");
          if (mounted) {
            setWorkspaceName(n);
            originalNameRef.current = n;
            setPlan(normalizePlan(initialPlan || "free"));
          }
        } else {
          try {
            const res = await client.workspace.bySlug.$get({ slug });
            const d = await res.json();
            const w = (d as { workspace?: { name?: string; plan?: string } })?.workspace;
            const n = String(w?.name || "");
            if (mounted) {
              setWorkspaceName(n);
              originalNameRef.current = n;
              setPlan(normalizePlan(String(w?.plan || "free")));
            }
          } catch {
            if (mounted) {
              setWorkspaceName("");
              originalNameRef.current = "";
              setPlan(normalizePlan("free"));
            }
          }
        }
        
      } catch {
        if (mounted) {
          setWorkspaceName("");
          originalNameRef.current = "";
          setPlan(normalizePlan("free"));
        }
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
          const nextName = workspaceName.trim();
          const r = await updateWorkspaceName(slug, nextName);
          if (!r.ok) throw new Error(r.message || "Update failed");
          originalNameRef.current = nextName;
          try {
            updateWorkspaceNameInCache(queryClient, slug, nextName);
          } catch {
            //ignore
          }
        }
      const brandingInput: BrandingConfig & { logoUrl?: string } = {};
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
          updateWorkspaceLogoInCache(queryClient, slug, logoUrl.trim());
        } catch {
          //ignore
        }
      }
      toast.success("Settings updated");
    } catch (error: unknown) {
      if (canBranding) applyBrandPrimary(prevP || "#3b82f6");
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to update settings";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Branding" description="Change your brand settings.">
      <div className="space-y-6 ">
        <div className="flex items-center justify-between ">
          <div className="text-sm">Workspace Name</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <Input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="h-9 w-[220px] text-right"
              maxLength={15}
            />
          </div>
        </div>
        <div className="flex items-center justify-between ">
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
        <div className="flex items-center justify-between ">
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
        <div className="flex items-center justify-between ">
          <div className="text-sm">Sidebar Position</div>
          <div className="w-full max-w-md flex items-center justify-end">
            <SidebarPositionPicker value={sidebarPosition} onSelect={(p) => setSidebarPosition(p)} disabled={!canEditBranding} />

          </div>
        </div>

        <div className="flex items-center justify-between ">
          <div className="text-sm">Theme</div>
          <div className="w-full max-w-md flex items-center justify-end">

                 <ThemePicker value={theme} onSelect={(t) => setTheme(t)} disabled={!canEditBranding} />
          </div>
        </div>

        <div className="flex items-center justify-between ">
          <div className="text-sm">Layout Style</div>
          <div className="w-full max-w-md flex items-center justify-end">

            <LayoutStylePicker value={layoutStyle} onSelect={(l) => setLayoutStyle(l)} disabled={!canEditBranding} />


          </div>
        </div>

        <div className="flex items-center justify-between ">
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

        <PlanNotice slug={slug} feature="branding" plan={plan} />
        <LoadingButton
          onClick={handleSave}
          loading={saving}
          disabled={loading || brandingAccessLoading || !canEditBranding}
        >
          Save
        </LoadingButton>
      </div>

    </SectionCard>
  );
}
