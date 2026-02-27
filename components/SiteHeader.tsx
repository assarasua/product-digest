"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics";

type NavItem = {
  href: string;
  label: string;
  matchPrefixes?: string[];
};

type NavGroup = {
  id: "contenido" | "recursos" | "comunidad";
  label: string;
  contextMatchers: string[];
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    id: "contenido",
    label: "Contenido",
    contextMatchers: ["/", "/product-builders", "/archive", "/tags", "/tag", "/post"],
    items: [
      { href: "/", label: "Hub IA" },
      { href: "/product-builders", label: "Human Insights" },
      { href: "/archive", label: "Artículos", matchPrefixes: ["/post"] },
      { href: "/tags", label: "Temas", matchPrefixes: ["/tag"] }
    ]
  },
  {
    id: "recursos",
    label: "Recursos",
    contextMatchers: ["/product-leaders-wiki", "/libros"],
    items: [
      { href: "/product-leaders-wiki", label: "Product Leaders" },
      { href: "/libros", label: "Libros" }
    ]
  },
  {
    id: "comunidad",
    label: "Comunidad",
    contextMatchers: ["/eventos", "/about", "/cookies"],
    items: [
      { href: "/eventos", label: "Eventos" },
      { href: "/about", label: "Acerca de" }
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

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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

  const activeGroupLabel = useMemo(() => {
    const byActiveItem = navGroups.find((group) => group.items.some((item) => isLinkActive(pathname, item)));
    if (byActiveItem) {
      return byActiveItem.label;
    }

    const byContext = navGroups.find((group) =>
      group.contextMatchers.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    );
    return byContext?.label;
  }, [pathname]);

  const handleToggleMenu = () => {
    setMenuOpen((previous) => {
      const next = !previous;
      if (next) {
        trackAnalyticsEvent({ type: "nav_menu_open" });
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
          {activeGroupLabel ? <p className="nav-context">Sección: {activeGroupLabel}</p> : null}
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

      <div id="site-nav-groups" className={`nav-groups${menuOpen ? " is-open" : ""}`}>
        {navGroups.map((group) => (
          <div key={group.id} className="nav-group">
            <p className="nav-group-title">{group.label}</p>
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
        ))}
      </div>
    </nav>
  );
}
