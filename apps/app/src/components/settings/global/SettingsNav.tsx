"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { buildSettingsNavGroups, getSlugFromPath } from "@/config/nav";
import SidebarItem from "@/components/sidebar/SidebarItem";
import { sidebarSectionLabelClassName } from "@/components/sidebar/styles";

export default function SettingsNav({
  onLinkClick,
  collapsed = false,
}: {
  onLinkClick?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname() || "";
  const slug = getSlugFromPath(pathname);
  const groups = React.useMemo(() => buildSettingsNavGroups(slug), [slug]);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.title} role="group" aria-label={group.title}>
          {!collapsed ? (
            <div className={`${sidebarSectionLabelClassName} mb-2`}>
              {group.title}
            </div>
          ) : null}
          <div className="space-y-1.5">
            {group.items.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                pathname={pathname}
                mutedIcon
                collapsed={collapsed}
                onClick={onLinkClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
