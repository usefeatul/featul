"use client";

import React from "react";
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
import { useCanEditBranding } from "@/hooks/useWorkspaceAccess";
import { getPlanLimits, normalizePlan, type PlanKey } from "@/lib/plan";
import { fetchWorkspaceBySlug } from "@/lib/workspace-client";
import type { BrandingConfig } from "../../../types/branding";
import { updateWorkspaceLogoInCache, updateWorkspaceNameInCache } from "./branding-cache";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";
import { CheckIcon } from "@featul/ui/icons/check";

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
  const [logoUrl, setLogoUrl] = React.useState(String(initialConfig?.logoUrl || ""));
  const [primaryColor, setPrimaryColor] = React.useState(initialPrimary);
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
  const workspaceNameInputSize = Math.max(
    4,
    Math.min(15, Math.max(workspaceName.length, 1)),
  );

  React.useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const conf0 = initialConfig || null;
        if (mounted && conf0) {
          setLogoUrl(conf0.logoUrl || "");
          const currentPrimary = conf0.primaryColor || "#3b82f6";
          setPrimaryColor(currentPrimary);
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
            setPrimaryColor(currentPrimary);
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
            const workspace = await fetchWorkspaceBySlug(slug);
            const n = String(workspace?.name || "");
            if (mounted) {
              setWorkspaceName(n);
              originalNameRef.current = n;
              setPlan(normalizePlan(String(workspace?.plan || "free")));
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
  }, [slug, initialConfig, initialHidePoweredBy, initialPlan, initialWorkspaceName]);

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
      captureAnalyticsEvent(analyticsEvents.brandingUpdated, {
        workspace_slug: slug,
        has_logo: Boolean(logoUrl.trim()),
        theme,
        layout_style: layoutStyle,
        sidebar_position: sidebarPosition,
        hide_powered_by: hidePoweredBy,
      });
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
    <section className="text-foreground">
      <header className="pb-8">
        <h1 className="text-base font-heading font-semibold">Branding</h1>
        <p className="mt-1 text-sm font-light leading-relaxed text-accent">
          Change your brand settings.
        </p>
      </header>

      <div className="divide-y divide-border border-y border-border">
        <SettingsRow label="Logo">
          <LogoUploader
            slug={slug}
            value={logoUrl}
            onChange={setLogoUrl}
            disabled={!getPlanLimits(plan).allowBranding || !canEditBranding}
          />
        </SettingsRow>

        <SettingsRow label="Name">
            <Input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="h-9 w-full min-w-0 max-w-64 rounded-md border-border bg-card px-3 text-sm"
              size={workspaceNameInputSize}
              maxLength={15}
            />
        </SettingsRow>

        <SettingsRow label="Primary Color">
          <ColorPicker
            valueHex={primaryColor}
            onSelect={(c) => {
              setPrimaryColor(c.primary);
              applyBrandPrimary(c.primary);
            }}
            disabled={!getPlanLimits(plan).allowBranding || !canEditBranding}
          />
        </SettingsRow>

        <SettingsRow label="Sidebar Position">
          <SidebarPositionPicker
            value={sidebarPosition}
            onSelect={(p) => setSidebarPosition(p)}
            disabled={!canEditBranding}
          />
        </SettingsRow>

        <SettingsRow label="Theme">
          <ThemePicker
            value={theme}
            onSelect={(t) => setTheme(t)}
            disabled={!canEditBranding}
          />
        </SettingsRow>

        <SettingsRow label="Layout Style">
          <LayoutStylePicker
            value={layoutStyle}
            onSelect={(l) => setLayoutStyle(l)}
            disabled={!canEditBranding}
          />
        </SettingsRow>

        <SettingsRow label='Hide "Powered by" Branding'>
          <Switch
            checked={hidePoweredBy}
            onCheckedChange={(v) => setHidePoweredBy(Boolean(v))}
            aria-label="Hide Powered by"
            disabled={!getPlanLimits(plan).allowHidePoweredBy || !canEditBranding}
          />
        </SettingsRow>
      </div>

      <div className="space-y-3 pt-5">
        <PlanNotice slug={slug} feature="branding" plan={plan} />
        <LoadingButton
          onClick={handleSave}
          loading={saving}
          disabled={loading || brandingAccessLoading || !canEditBranding}
          className="h-9 rounded-md px-3"
        >
          <CheckIcon className="mr-1.5 size-4" size={16} />
          Save
        </LoadingButton>
      </div>
    </section>
  );
}

function SettingsRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3">
      <div className="min-w-0 text-sm text-foreground">{label}</div>
      <div className="flex min-w-0 justify-end">{children}</div>
    </div>
  );
}
