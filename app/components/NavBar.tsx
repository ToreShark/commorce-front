"use client";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/app/lib/CategoryContext";
import Link from "@/node_modules/next/link";
import { usePathname } from "@/node_modules/next/navigation";
import { ShoppingBag, User, Settings, FileText } from "lucide-react";

export default function NavBar() {
  //   const { categories } = useCategories();
  const pathname = usePathname();

  //   const links = [
  //     { name: "Home", href: "/" },
  //     ...categories.map((cat) => ({ name: cat.name, href: `/${cat.slug}` })),
  //   ];
  //   console.log(categories);
  //   console.log(links);

  const links = [
    { name: "Главная", href: "/" },
    { name: "Покупки", href: "/shop" },
    { name: "О компании", href: "/about" },
    { name: "Помощь", href: "/help" },
    { name: "Контакты", href: "/contacts" },
  ];

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
            <div key={idx}>
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

        <div className="flex divide-x border-r sm:border-l">
          <Button
            variant={"outline"}
            // onClick={() => handleCartClick()}
            className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
          >
            <ShoppingBag />
            <span className="hidden text-xs font-semibold text-gray-500 sm:block">
              Корзина
            </span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-y-1.5 h-12 w-12 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-none"
            // onClick={() => handleAccountClick()}  // Implement or pass this function based on your application logic
          >
            <User />
            <span className="hidden text-xs font-semibold text-gray-500 sm:block">
              Аккаунт
            </span>
          </Button>
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
