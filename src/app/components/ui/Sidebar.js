"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Box,
  Package,
  Ticket,
  User,
  Image as ImageIcon,
  X,
  ShoppingCart,
  Tags
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Report",
        href: "/admin/ecommerce/report",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        label: "Orders",
        href: "/admin/ecommerce/orders",
        icon: Box,
      },
      {
        label: "Incomplete Orders",
        href: "/admin/ecommerce/incomplete-orders",
        icon: ShoppingCart,
      },
      {
        label: "Customers",
        href: "/admin/ecommerce/customers",
        icon: User,
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        label: "Products",
        href: "/admin/ecommerce/products",
        icon: Package,
      },
      {
        label: "Coupons",
        href: "/admin/ecommerce/coupons",
        icon: Ticket,
      },
      {
        label: "Banners",
        href: "/admin/ecommerce/banners",
        icon: ImageIcon,
      },
      {
        label:"Brand",
        href: "/admin/ecommerce/brands",
        icon: Tags,
      }
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  function handleNavigation() {
    onClose?.();
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          border-r border-slate-200
          bg-white text-slate-700
          shadow-xl shadow-slate-900/10
          transition-transform duration-300 ease-in-out
          lg:static lg:z-auto lg:w-64
          lg:translate-x-0 lg:shadow-none
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <Link
            href="/admin/dashboard"
            onClick={handleNavigation}
            className="flex items-center justify-center w-full"
          >
            <Image
              src="/c2c-logo.webp"
              alt="C2C Supplement"
              width={180}
              height={60}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="
              rounded-lg
              p-2
              text-slate-400
              transition-colors
              hover:bg-slate-100
              hover:text-slate-700
              lg:hidden
            "
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navGroups.map((group, groupIndex) => (
            <div
              key={group.label}
              className={groupIndex > 0 ? "mt-7" : ""}
            >
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavigation}
                      aria-current={isActive ? "page" : undefined}
                      className={`
                        group relative flex items-center gap-3
                        rounded-lg px-3 py-2.5
                        text-[13px] font-medium
                        transition-all duration-150
                        ${
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }
                      `}
                    >
                      {isActive && (
                        <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-blue-600" />
                      )}

                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2.2 : 1.8}
                        className={`
                          shrink-0 transition-colors
                          ${
                            isActive
                              ? "text-blue-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          }
                        `}
                      />

                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
              A
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">
                Admin
              </p>

              <p className="truncate text-[11px] text-slate-400">
                Store Manager
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}