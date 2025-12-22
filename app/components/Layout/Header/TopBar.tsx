"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserInfo } from "@/app/lib/interfaces/auth.interface";
import { getCurrentUser } from "@/app/lib/data";

interface TopBarProps {
  className?: string;
}

export default function TopBar({ className }: TopBarProps) {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const result = await getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        }
      }
    };
    checkAuth();
  }, []);

  return (
    <div
      className={`w-full bg-white h-10 border-b border-qgray-border ${
        className || ""
      }`}
    >
      <div className="container-x mx-auto h-full">
        <div className="flex justify-between items-center h-full">
          <div className="topbar-nav">
            <ul className="flex space-x-6">
              {user ? (
                <>
                  <li>
                    <Link href="/login">
                      <span className="text-xs leading-6 text-green-600 font-500">
                        {user.firstName} {user.lastName}
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard">
                      <span className="text-xs leading-6 text-qblack font-500">
                        Админ-панель
                      </span>
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/login">
                    <span className="text-xs leading-6 text-qblack font-500">
                      Войти
                    </span>
                  </Link>
                </li>
              )}
              <li>
                <Link href="/purchaseHistory">
                  <span className="text-xs leading-6 text-qblack font-500">
                    История заказов
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/hello">
                  <span className="text-xs leading-6 text-qblack font-500">
                    О нас
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="topbar-dropdowns sm:block hidden">
            <div className="flex space-x-6 items-center">
              <a
                href="https://wa.me/77019654666"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-qblack font-500 hover:text-qyellow transition-colors"
              >
                +7 (701) 965-46-66
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
