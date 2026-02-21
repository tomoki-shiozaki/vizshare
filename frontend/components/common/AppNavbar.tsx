"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/features/auth/context/useAuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/* ======================
   ナビ定義
====================== */
const mainLinks = [{ to: "/", label: "ホーム" }];
const dropdownLinks = [{ to: "/about", label: "このサイトについて" }];

/* ======================
   共通 NavbarLink
====================== */
type NavbarLinkProps = {
  to: string;
  active?: boolean;
  children: React.ReactNode;
};

function NavbarLink({ to, active, children }: NavbarLinkProps) {
  return (
    <Link
      href={to}
      className={`px-2 py-1 rounded-md transition-colors ${
        active
          ? "text-white font-semibold bg-white/20"
          : "text-white/80 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
}

/* ======================
   認証エリア
====================== */
type AuthNavProps = {
  currentUsername: string | null;
  logout: () => void;
};

const AuthNav: React.FC<AuthNavProps> = ({ currentUsername, logout }) => {
  if (currentUsername) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">{currentUsername} さん</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/80 hover:text-white hover:bg-white/10"
          onClick={logout}
        >
          ログアウト
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <NavbarLink to="/login">ログイン</NavbarLink>
      <NavbarLink to="/signup">新規登録</NavbarLink>
    </div>
  );
};

/* ======================
   Navbar 本体
====================== */
export const AppNavbar = () => {
  const pathname = usePathname();
  const { currentUsername, logout } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-500 text-white relative z-50">
      <div
        className="
          container mx-auto
          flex flex-col md:flex-row
          md:items-center md:justify-between
          px-4 py-2
      "
      >
        {/* 上段：ロゴ + ハンバーガー */}
        <div className="flex items-center justify-between w-full md:w-auto md:mr-6">
          <Link href="/" className="text-lg font-bold whitespace-nowrap">
            Vizshare
          </Link>

          <button
            className="md:hidden p-2 rounded hover:bg-white/10"
            onClick={() => setIsOpen((v) => !v)}
          >
            <span className="sr-only">メニュー切替</span>☰
          </button>
        </div>
        {/* 下段：ナビ + 認証 */}
        <div
          className={`w-full md:flex md:items-center md:gap-4 mt-2 md:mt-0 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          {/* 左：ナビゲーション */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            {mainLinks.map((link) => (
              <NavbarLink
                key={link.to}
                to={link.to}
                active={pathname === link.to}
              >
                {link.label}
              </NavbarLink>
            ))}

            {/* Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="
                    w-full md:w-auto
                    justify-start
                    text-white/80
                    hover:text-white
                    hover:bg-white/10
                  "
                >
                  サイト情報
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="
                  z-[400]
                  bg-blue-50/95
                  text-blue-900
                  border border-blue-100
                  shadow-lg
                "
              >
                {dropdownLinks.map((link) => {
                  const isActive = pathname === link.to;
                  return (
                    <DropdownMenuItem asChild key={link.to}>
                      <Link
                        href={link.to}
                        className={`block w-full px-2 py-1 rounded ${
                          isActive ? "bg-blue-100 font-medium" : ""
                        }`}
                      >
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 右：認証 */}
          <div className="mt-2 md:mt-0 md:ml-auto">
            <AuthNav currentUsername={currentUsername} logout={logout} />
          </div>
        </div>
      </div>
    </nav>
  );
};
