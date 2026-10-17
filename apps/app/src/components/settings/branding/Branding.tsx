"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import SettingRow from "../global/row";
import PlanNotice from "../global/PlanNotice";
import { LoadingButton } from "@/components/global/LoadingButton";
import {
  loadBrandingBySlug,
  saveBranding,
  updateWorkspaceName,
} from "../../../lib/branding/service";
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
import { setLiveWorkspaceName, setWorkspaceLogo } from "@/lib/branding/store";
import { Input } from "@featul/ui/components/input";
import { cn } from "@featul/ui/lib/utils";
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar";
import { useQueryClient } from "@tanstack/react-query";
import { useCanEditBranding } from "@/hooks/useWorkspaceAccess";
import { getPlanLimits, normalizePlan, type PlanKey } from "@/lib/plan";
import { fetchWorkspaceBySlug } from "@/lib/workspace/client";
import type { BrandingConfig } from "../../../types/branding";
import { updateWorkspaceLogoInCache, updateWorkspaceNameInCache } from "./cache";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";

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
  const initialPrimary = initialConfig?.primaryColor || "#4d96e8";
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
  const originalLogoRef = React.useRef<string>(
    String(initialConfig?.logoUrl || ""),
  );
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
          originalLogoRef.current = conf0.logoUrl || "";
          const currentPrimary = conf0.primaryColor || "#4d96e8";
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
            originalLogoRef.current = conf.logoUrl || "";
            const currentPrimary = conf.primaryColor || "#4d96e8";
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

  const persistWorkspaceName = React.useCallback(
    async (nextName: string) => {
      const previousName = originalNameRef.current;
      if (!nextName) {
        setWorkspaceName(previousName);
        return false;
      }
      if (nextName === previousName) return true;
      if (!canEditBranding) {
        toast.error("You don’t have permission to update branding");
        return false;
      }

      originalNameRef.current = nextName;
      try {
        setLiveWorkspaceName(slug, nextName);
        updateWorkspaceNameInCache(queryClient, slug, nextName);
      } catch {
        // ignore cache errors
      }

      const result = await updateWorkspaceName(slug, nextName);
      if (!result.ok) {
        originalNameRef.current = previousName;
        setWorkspaceName(previousName);
        try {
          setLiveWorkspaceName(slug, previousName);
          updateWorkspaceNameInCache(queryClient, slug, previousName);
        } catch {
          // ignore cache errors
        }
        throw new Error(result.message || "Update failed");
      }
      return true;
    },
    [canEditBranding, queryClient, slug],
  );

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
    const nextLogoUrl = logoUrl.trim();
    const logoChanged = nextLogoUrl !== originalLogoRef.current.trim();
    if (canBranding) applyBrandPrimary(p);
    try {
      await persistWorkspaceName(workspaceName.trim());
      const brandingInput: BrandingConfig & { logoUrl?: string } = {};
      if (canBranding) {
        if (logoChanged && nextLogoUrl) brandingInput.logoUrl = nextLogoUrl;
        brandingInput.primaryColor = p;
      }
      brandingInput.theme = theme;
      brandingInput.layoutStyle = layoutStyle;
      brandingInput.sidebarPosition = sidebarPosition;
      if (canHidePoweredBy) brandingInput.hidePoweredBy = hidePoweredBy;
      const result = await saveBranding(slug, brandingInput);
      if (!result.ok) throw new Error(result.message || "Update failed");
      if (logoChanged && nextLogoUrl && canBranding) {
        originalLogoRef.current = nextLogoUrl;
        setWorkspaceLogo(slug, nextLogoUrl);
        try {
          updateWorkspaceLogoInCache(queryClient, slug, nextLogoUrl);
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
      if (canBranding) applyBrandPrimary(prevP || "#4d96e8");
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
    <div className="space-y-8">
      <SectionCard title="Brand">
        <div className="-mx-5 -my-4 divide-y divide-border/50 [&>*]:px-5">
          <SettingRow label="Workspace name" description="The name shown across your workspace and public board.">
            <Toolbar size="sm" className="w-fit">
              <Input
                variant="plain"
                aria-label="Workspace name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                onBlur={() => {
                  const nextName = workspaceName.trim();
                  if (nextName === originalNameRef.current) return;
                  void persistWorkspaceName(nextName)
                    .then((updated) => {
                      if (updated) toast.success("Saved");
                    })
                    .catch((error: unknown) => {
                      const message =
                        error instanceof Error && error.message
                          ? error.message
                          : "Failed to update name";
                      toast.error(message);
                    });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                className={cn(toolbarItemClass, "h-8 w-auto min-w-[4ch] px-2.5 text-right text-xs font-medium")}
                size={workspaceNameInputSize}
                maxLength={15}
                disabled={!canEditBranding}
              />
            </Toolbar>
          </SettingRow>
          <SettingRow label="Logo" description="Your workspace identity on the public board.">
            <LogoUploader
              slug={slug}
              value={logoUrl}
              onChange={(url) => {
                setLogoUrl(url);
                originalLogoRef.current = url;
              }}
              disabled={!getPlanLimits(plan).allowBranding || !canEditBranding}
            />
          </SettingRow>
        </div>
      </SectionCard>
      <SectionCard title="Appearance">
        <div className="-mx-5 -my-4 divide-y divide-border/50 [&>*]:px-5">
          <SettingRow label="Primary color" description="The accent used across your public board.">
            <ColorPicker
              valueHex={primaryColor}
              onSelect={(c) => {
                setPrimaryColor(c.primary);
                applyBrandPrimary(c.primary);
              }}
              disabled={!getPlanLimits(plan).allowBranding || !canEditBranding}
            />
          </SettingRow>
          <SettingRow label="Theme" description="Choose light, dark, or follow the visitor’s system preference.">
            <ThemePicker value={theme} onSelect={setTheme} disabled={!canEditBranding} />
          </SettingRow>
        </div>
      </SectionCard>
      <SectionCard title="Public board">
        <div className="-mx-5 -my-4 divide-y divide-border/50 [&>*]:px-5">
          <SettingRow label="Sidebar position" description="Choose which side holds your board navigation.">
            <SidebarPositionPicker value={sidebarPosition} onSelect={setSidebarPosition} disabled={!canEditBranding} />
          </SettingRow>
          <SettingRow label="Layout style" description="Set how much space appears between posts.">
            <LayoutStylePicker value={layoutStyle} onSelect={setLayoutStyle} disabled={!canEditBranding} />
          </SettingRow>
          <SettingRow label={'Hide "Powered by" branding'} description="Remove the featul attribution from your public board.">
            <Switch
              checked={hidePoweredBy}
              onCheckedChange={(v) => setHidePoweredBy(Boolean(v))}
              aria-label="Hide Powered by"
              disabled={!getPlanLimits(plan).allowHidePoweredBy || !canEditBranding}
            />
          </SettingRow>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <LoadingButton
          onClick={handleSave}
          loading={saving}
          disabled={loading || brandingAccessLoading || !canEditBranding}
        >
          Save changes
        </LoadingButton>
      </div>
      <PlanNotice slug={slug} feature="branding" plan={plan} />
    </div>
  );
}
