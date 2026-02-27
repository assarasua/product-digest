"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics";

type NavItem = {
  href: string;
  label: string;
  matchPrefixes?: string[];
};

type NavGroup = {
  id: "contenido" | "recursos";
  label: string;
  href: string;
  routePrefixes: string[];
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    id: "contenido",
    label: "Contenido",
    href: "/",
    routePrefixes: ["/", "/product-builders", "/archive", "/post", "/tags", "/tag"],
    items: [
      { href: "/", label: "Hub IA" },
      { href: "/product-builders", label: "Human Insights" },
      { href: "/archive", label: "Buscador", matchPrefixes: ["/post"] }
    ]
  },
  {
    id: "recursos",
    label: "Product Knowledge Center",
    href: "/product-leaders-wiki",
    routePrefixes: ["/eventos", "/about", "/product-leaders-wiki", "/libros", "/cookies"],
    items: [
      { href: "/eventos", label: "Eventos" },
      { href: "/about", label: "Acerca de" },
      { href: "/product-leaders-wiki", label: "Product Leaders" },
      { href: "/libros", label: "Libros" }
    ]
  }
];

function isLinkActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") {
    return pathname === "/";
  }

  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
    return true;
  }

  return (
    item.matchPrefixes?.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ?? false
  );
}

function getActiveGroupId(pathname: string): NavGroup["id"] {
  for (const group of navGroups) {
    if (group.routePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return group.id;
    }
  }

  return "contenido";
}

function getActiveGroup(pathname: string): NavGroup {
  const activeId = getActiveGroupId(pathname);
  return navGroups.find((group) => group.id === activeId) ?? navGroups[0];
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const activeGroup = getActiveGroup(pathname);
  const activeGroupId = activeGroup.id;
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState<NavGroup["id"]>(activeGroupId);

  useEffect(() => {
    setMenuOpen(false);
    setExpandedGroupId(activeGroupId);
  }, [activeGroupId, pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const handleToggleMenu = () => {
    setMenuOpen((previous) => {
      const next = !previous;
      if (next) {
        trackAnalyticsEvent({ type: "nav_menu_open" });
        setExpandedGroupId(activeGroupId);
      }
      return next;
    });
  };

  const toggleGroup = (groupId: NavGroup["id"]) => {
    setExpandedGroupId((previous) => {
      const next = previous === groupId ? previous : groupId;
      if (next !== previous) {
        trackAnalyticsEvent({ type: "nav_group_expand", groupId: next });
      }
      return next;
    });
  };

  return (
    <nav className="site-nav" aria-label="Navegación principal">
      <div className="site-nav-top">
        <div className="brand-wrap">
          <Link href="/" className="brand-link">
            Product Digest
          </Link>
        </div>
        <button
          type="button"
          className="nav-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-nav-groups"
          onClick={handleToggleMenu}
        >
          {menuOpen ? "Cerrar" : "Menú"}
        </button>
      </div>

      <div className="site-nav-desktop" aria-label="Navegación de escritorio">
        <div className="nav-level-1" aria-label="Categorías principales">
          {navGroups.map((group) => {
            const active = group.id === activeGroupId;
            return (
              <Link
                key={group.id}
                href={group.href}
                className={`nav-category${active ? " is-active" : ""}`}
                data-active={active ? "true" : "false"}
                aria-current={active ? "true" : undefined}
              >
                {group.label}
              </Link>
            );
          })}
        </div>
        <div className="nav-level-2" aria-label={`Secciones de ${activeGroup.label}`}>
          <div key={activeGroupId} className="nav-subnav nav-subnav-enter">
            {activeGroup.items.map((item) => {
              const active = isLinkActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-subnav-link${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div id="site-nav-groups" className={`nav-groups${menuOpen ? " is-open" : ""}`}>
        {navGroups.map((group) => (
          <div key={group.id} className="nav-group">
            <button
              type="button"
              className="nav-group-toggle"
              aria-expanded={expandedGroupId === group.id}
              aria-controls={`nav-group-panel-${group.id}`}
              onClick={() => toggleGroup(group.id)}
            >
              <span className="nav-group-title">{group.label}</span>
              <span className={`nav-group-chevron${expandedGroupId === group.id ? " is-open" : ""}`} aria-hidden="true">
                ▾
              </span>
            </button>
            <div
              id={`nav-group-panel-${group.id}`}
              className={`nav-group-panel${expandedGroupId === group.id ? " is-open" : ""}`}
              aria-hidden={expandedGroupId !== group.id}
            >
              <div className="nav-links">
                {group.items.map((item) => {
                  const active = isLinkActive(pathname, item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-link${active ? " is-active" : ""}`}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
