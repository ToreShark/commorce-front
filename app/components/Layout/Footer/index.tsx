"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube } from "@/app/components/icons";

export default function Footer() {
  return (
    <footer
      className="footer-section-wrapper bg-qblack"
      style={{
        backgroundImage: "url(/assets/images/footer-four.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container-x block mx-auto pt-[60px] lg:pt-[83px]">
        <div className="lg:flex justify-between mb-[60px] lg:mb-[95px]">
          {/* Logo & Main Links */}
          <div className="lg:w-4/10 w-full mb-10 lg:mb-0">
            <div className="mb-10 lg:mb-14">
              <Link href="/">
                <Image
                  width={152}
                  height={36}
                  src="/assets/images/logo-5.svg"
                  alt="CrysShop"
                />
              </Link>
            </div>
            <div>
              <ul className="flex flex-col space-y-5">
                <li>
                  <Link href="/purchaseHistory">
                    <span className="text-white text-[15px] hover:text-qyellow hover:underline transition-colors">
                      Отслеживание заказа
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/hello">
                    <span className="text-white text-[15px] hover:text-qyellow hover:underline transition-colors">
                      Доставка и возврат
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/hello">
                    <span className="text-white text-[15px] hover:text-qyellow hover:underline transition-colors">
                      Гарантия
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* About Us */}
          <div className="lg:w-2/10 w-full mb-10 lg:mb-0">
            <div className="mb-5">
              <h6 className="text-[18px] font-500 text-white">О нас</h6>
            </div>
            <div>
              <ul className="flex flex-col space-y-5">
                <li>
                  <Link href="/hello">
                    <span className="text-white text-[15px] hover:text-qyellow hover:underline transition-colors">
                      Наша история
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/hello">
                    <span className="text-white text-[15px] hover:text-qyellow hover:underline transition-colors">
                      Контакты
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Shop */}
          <div className="lg:w-2/10 w-full mb-10 lg:mb-0">
            <div className="mb-5">
              <h6 className="text-[18px] font-500 text-white">Магазин</h6>
            </div>
            <div>
              <ul className="flex flex-col space-y-5">
                <li>
                  <Link href="/shop">
                    <span className="text-white text-[15px] hover:text-qyellow hover:underline transition-colors">
                      Каталог
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/basket">
                    <span className="text-white text-[15px] hover:text-qyellow hover:underline transition-colors">
                      Корзина
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Useful Links */}
          <div className="lg:w-2/10 w-full mb-10 lg:mb-0">
            <div className="mb-5">
              <h6 className="text-[18px] font-500 text-white">Информация</h6>
            </div>
            <div>
              <ul className="flex flex-col space-y-5">
                <li>
                  <Link href="/hello">
                    <span className="text-white text-[15px] hover:text-qyellow hover:underline transition-colors">
                      Безопасная оплата
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/hello">
                    <span className="text-white text-[15px] hover:text-qyellow hover:underline transition-colors">
                      Политика конфиденциальности
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/hello">
                    <span className="text-white text-[15px] hover:text-qyellow hover:underline transition-colors">
                      Условия использования
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bottom-bar border-t border-qgray-border lg:h-[82px] py-5 lg:py-0 lg:flex justify-between items-center">
          <div className="flex lg:space-x-5 justify-between items-center mb-3 lg:mb-0">
            <div className="flex space-x-5 items-center">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="fill-current text-white hover:text-qyellow transition-colors" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="fill-current text-white hover:text-qyellow transition-colors" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube className="fill-current text-white hover:text-qyellow transition-colors" />
              </a>
            </div>
            <span className="sm:text-base text-[10px] text-white font-300">
              © {new Date().getFullYear()}{" "}
              <Link href="/" className="font-500 text-qyellow mx-1">
                CrysShop
              </Link>
              Все права защищены
            </span>
          </div>
          <div>
            <Image
              width={318}
              height={28}
              src="/assets/images/payment-getways.png"
              alt="Способы оплаты"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
