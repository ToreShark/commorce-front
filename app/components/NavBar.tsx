"use client";
import { Button } from "@/components/ui/button";
import Link from "@/node_modules/next/link";
import { usePathname, useRouter } from "@/node_modules/next/navigation";
import { ShoppingBag, User, Settings, FileText, LogOut } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { getUser, logout } from "../lib/data";
import CartDropdown from "./cart-dropdown/cart-drop.down.component";
import { CartContext } from "../lib/CartContext";
import { UserContext } from "../lib/UserInfo";
import "@/app/components/nav-bar/nav-bar.style.scss";

export default function NavBar() {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const { isCartOpen, setIsCartOpen, cartCount } = useContext(CartContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleIsCartOpen = () => setIsCartOpen(!isCartOpen);
  const toggleMobileCartOpen = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  // const [user, setUser] = useState<UserData | null>(null);
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const links = [
    { name: "Главная", href: "/" },
    { name: "Покупки", href: "/shop" },
    { name: "О компании", href: "/hello" },
    { name: "Помощь", href: "/sendcode" },
    { name: "Контакты", href: "/contacts" },
  ];

  const handleAccountClick = () => {
    router.push("/sendphone");
  };

  // console.log("user", user);

  const handleLogout = async () => {
    // тут надо использовать вызвать метод logout из контекста
    try {
      const message = await logout();
      console.log(message);
      localStorage.removeItem("accessToken");
      setCurrentUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const AccountButton = () => (
    <Button
      variant="outline"
      className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
      onClick={handleAccountClick}
    >
      <User />
      <span className="hidden text-xs font-semibold text-gray-500 sm:block">
        Аккаунт
      </span>
    </Button>
  );

  const LogoutButton = () => (
    <Button
      variant="outline"
      className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
      onClick={handleLogout}
    >
      <LogOut />
      <span className="hidden text-xs font-semibold text-gray-500 sm:block">
        Выйти
      </span>
    </Button>
  );

  const renderButton = () => {
    if (currentUser) {
      return <LogoutButton />;
    } else {
      return <AccountButton />;
    }
  };

  const handleCartClick = () => {
    console.log("TEST CART CLICK");
    router.push("/cart");
  };

  return (
    <header className="mb-8 border-b">
      <div className="flex items-center justify-between mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl">
        <Link href="/">
          <h1 className="text-4xl font-bold">
            <span className="text-primary">CRYSSHOP</span>
          </h1>
        </Link>
        {/* Корзина для мобильной версии */}
        <div className="lg:hidden">
          <Button
            variant={"outline"}
            onClick={toggleMobileCartOpen}
            className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none relative mb-2"
          >
            <ShoppingBag />
            <span className="hidden text-xs font-semibold text-gray-500 sm:block">
              Корзина
            </span>
            <span className="absolute top-0 right-0 flex items-center justify-center h-6 w-6 bg-red-500 rounded-full text-white text-xs">
              {cartCount}
            </span>
          </Button>
          {isMobileMenuOpen && <CartDropdown onMobileClose={() => setIsMobileMenuOpen(false)} />}
        </div>
        <nav className="hidden gap-8 lg:flex 2xl:ml-16">
          {links.map((link, idx) => (
            <div key={idx} className="flex items-center nav-link">
              {pathname === link.href ? (
                <Link
                  className="text-lg font-semibold text-primary"
                  href={link.href}
                >
                  {link.name}
                </Link>
              ) : (
                <Link
                  href={link.href}
                  className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-primary"
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Элементы управления для больших экранов */}
        <div className="hidden lg:flex divide-x border-r sm:border-l">
          <Button
            variant={"outline"}
            onClick={toggleIsCartOpen}
            className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none relative"
          >
            <ShoppingBag />
            <span className="hidden text-xs font-semibold text-gray-500 sm:block">
              Корзина
            </span>
            <span className="absolute top-0 right-0 flex items-center justify-center h-6 w-6 bg-red-500 rounded-full text-white text-xs">
              {cartCount}
            </span>
          </Button>
          {isCartOpen && <CartDropdown />}
          {renderButton()}

          {currentUser && currentUser.roleId === 1 && (
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
            >
              <Settings />
              <span className="hidden text-xs font-semibold text-gray-500 sm:block">
                Админ
              </span>
            </Button>
          )}

          {currentUser && (
            <Button
              variant="outline"
              className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
              onClick={() => router.push("/purchaseHistory")}
            >
              <FileText />
              <span className="hidden text-xs font-semibold text-gray-500 sm:block">
                История
              </span>
            </Button>
          )}
        </div>
        {/* при размере экрана менее 1023 открывается этот бургер меню */}
        <div className="lg:hidden">
          <button onClick={() => setIsNavOpen(!isNavOpen)} className="p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
        {/* Панель бургер-меню */}
        <div
          className={`fixed top-0 right-0 h-full z-40 transition-transform transform ${
            isNavOpen ? "translate-x-0" : "translate-x-full"
          } bg-white dark:bg-slate-800 w-9/10`}
        >
          <button onClick={() => setIsNavOpen(false)} className="p-2">
            {/* Иконка закрытия */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          {/* Кнопки управления перед меню навигации */}
          <div className="flex flex-col items-center">
            {/* <Button
              variant={"outline"}
              onClick={toggleMobileCartOpen}
              className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none relative mb-2"
            >
              <ShoppingBag />
              <span className="hidden text-xs font-semibold text-gray-500 sm:block">
                Корзина
              </span>
              <span className="absolute top-0 right-0 flex items-center justify-center h-6 w-6 bg-red-500 rounded-full text-white text-xs">
                {cartCount}
              </span>
            </Button>
            {isMobileMenuOpen && <CartDropdown />} */}
            {renderButton()}

            {/* Дополнительные кнопки могут быть добавлены сюда, если требуется */}
            {/* Пример: кнопка Админ */}
            {currentUser && currentUser.roleId === 1 && (
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
              >
                <Settings />
                <span className="hidden text-xs font-semibold text-gray-500 sm:block">
                  Админ
                </span>
              </Button>
            )}

            {/* Пример: кнопка История */}
            {currentUser && (
              <Button
                variant="outline"
                className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
                onClick={() => router.push("/purchaseHistory")}
              >
                <FileText />
                <span className="hidden text-xs font-semibold text-gray-500 sm:block">
                  История
                </span>
              </Button>
            )}
          </div>
          {/* Содержимое меню */}
          <nav>
            {links.map((link, idx) => (
              <div key={idx} className="p-4 border-b border-gray-200">
                <Link
                  href={link.href}
                  className="text-lg font-semibold text-gray-600 dark:text-white hover:text-primary"
                >
                  {link.name}
                </Link>
              </div>
            ))}
          </nav>
          {/* Кнопки управления */}
        </div>
      </div>
    </header>
  );
}
