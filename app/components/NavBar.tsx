"use client";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/app/lib/CategoryContext";
import Link from "@/node_modules/next/link";
import { usePathname, useRouter } from "@/node_modules/next/navigation";
import { ShoppingBag, User, Settings, FileText, LogOut } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import AuthContext, { UserData } from "../lib/AuthContext";
import { getUser, logout } from "../lib/data";

export default function NavBar() {
  const auth = useContext(AuthContext);
  // const [user, setUser] = useState<UserData | null>(null);
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth?.user) {
      setIsLoading(true);
      const fetchData = async () => {
        try {
          const userData = await getUser();
          auth?.setUserInAuthContext(userData);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [auth?.user]);

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
      localStorage.removeItem('accessToken');
      auth?.setUserInAuthContext(null);
      router.push('/'); 
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
      <span className="hidden text-xs font-semibold text-gray-500 sm:block">Аккаунт</span>
    </Button>
  );
  
  const LogoutButton = () => (
    <Button
      variant="outline"
      className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
      onClick={handleLogout}
    >
      <LogOut />
      <span className="hidden text-xs font-semibold text-gray-500 sm:block">Выйти</span>
    </Button>
  );
  
  const renderButton = () => {
    if (auth?.user) {
      return <LogoutButton />;
    } else {
      return <AccountButton />;
    }
  };

  const handleCartClick = () => {
    console.log("TEST CART CLICK")
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
        <nav className="hidden gap-12 lg:flex 2xl:ml-16">
          {links.map((link, idx) => (
            <div key={idx} className="flex items-center">
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

        <div className="flex items-center lg:hidden">
          <button
            className="navbar-burger flex items-center px-3 py-2 border rounded text-primary border-primary"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <svg
              className="fill-current h-3 w-3"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>

        {/* Slide-out navigation panel for mobile */}
        <div
          className={`${
            isNavOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          } absolute flex flex-col items-center justify-between bg-white dark:bg-slate-800 dark:text-white transition duration-500 ease-in-out transform top-0 left-0 right-0 bottom-0 lg:hidden z-50 pt-2`}
        >
          <button className="self-end m-4" onClick={() => setIsNavOpen(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="flex flex-col items-center">
            <nav className="mb-b">
              {links.map((link, idx) => (
                <div key={idx} className="mb-8">
                  <Link
                    href={link.href}
                    className="text-lg font-semibold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
                    onClick={() => setIsNavOpen(false)}
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </nav>
            <div className="flex flex-col items-center mb-8">

              <Button
                variant={"outline"}
                // onClick={handleCartClick}
                className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none mb-4"
              >
                <ShoppingBag />
                <span className="hidden text-xs font-semibold text-gray-500 sm:block">
                  Корзина
                </span>
              </Button>
              
             {/*УДАЛИЛ ФРАГМЕНТ КОДА, ВСТАВИЛ В ТЕЛЕГУ*/}

              <Button
                variant="outline"
                className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none mb-4"
              >
                <Settings />
                <span className="hidden text-xs font-semibold text-gray-500 sm:block">
                  Админ
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
              >
                <FileText />
                <span className="hidden text-xs font-semibold text-gray-500 sm:block">
                  История
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex divide-x border-r sm:border-l hidden lg:flex">
          <Button
            variant={"outline"}
            // onClick={() => handleCartClick()}
            onClick={() => handleCartClick()}
            className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
          >
            <ShoppingBag />
            <span className="hidden text-xs font-semibold text-gray-500 sm:block">
              Корзина
            </span>
          </Button>
          {/*тут вставляю {renderButton()}*/}
          {renderButton()}



          {/*КОММЕНТИРУЮ СТРОКИ*/}

          {/* <Button
            variant="outline"
            className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
            onClick={() => handleAccountClick()} // Implement or pass this function based on your application logic
          >
            <User />
            <span className="hidden text-xs font-semibold text-gray-500 sm:block">
              Аккаунт
            </span>
          </Button> */}

          {/* Admin Panel Button */}
          <Button
            variant="outline"
            className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
            // onClick={() => handleAdminPanelClick()}  // Implement or pass this function based on your application logic for admin panel
          >
            <Settings />
            <span className="hidden text-xs font-semibold text-gray-500 sm:block">
              Админ
            </span>
          </Button>

          {/* Purchase History Button */}
          <Button
            variant="outline"
            className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
            // onClick={() => handlePurchaseHistoryClick()}  // Implement or pass this function based on your application logic for purchase history
          >
            <FileText />
            <span className="hidden text-xs font-semibold text-gray-500 sm:block">
              История
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
