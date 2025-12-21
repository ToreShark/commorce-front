"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/app/lib/interfaces/product.interface";

interface BannerProps {
  className?: string;
  products?: Product[];
}

export default function Banner({ className, products = [] }: BannerProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // Получаем первые 3 товара для баннера
  const [mainProduct, secondProduct, thirdProduct] = products.slice(0, 3);

  const getImageUrl = (product: Product) => {
    if (product?.images?.[0]?.imagePath) {
      return `${apiUrl}${product.images[0].imagePath}`;
    }
    if (product?.image) {
      return `${apiUrl}${product.image}`;
    }
    return "/assets/images/product-img-1.jpg";
  };

  const getDiscountedPrice = (product: Product) => {
    if (product.discountPercentage > 0) {
      return product.price - (product.price * product.discountPercentage) / 100;
    }
    return null;
  };

  return (
    <>
      <div className={`w-full ${className || ""}`}>
        <div className="container-x mx-auto">
          <div className="main-wrapper w-full">
            {/* Banner Grid */}
            <div className="banner-card xl:flex xl:space-x-[30px] xl:h-[600px] mb-[30px]">
              {/* Main Product - Left Side */}
              {mainProduct ? (
                <div className="xl:w-[740px] w-full h-full">
                  <Link href={`/product/${mainProduct.slug}`}>
                    <div className="relative w-full h-[400px] xl:h-full bg-[#F5F5F5] rounded-lg overflow-hidden group">
                      <Image
                        src={getImageUrl(mainProduct)}
                        alt={mainProduct.name || mainProduct.title}
                        fill
                        className="object-contain p-8 group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 1280px) 100vw, 740px"
                      />
                      {/* Product Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white text-sm mb-1">
                          {mainProduct.categoryName || "Каталог"}
                        </p>
                        <h2 className="text-white text-xl font-bold mb-2 line-clamp-2">
                          {mainProduct.name || mainProduct.title}
                        </h2>
                        <div className="flex items-center space-x-2">
                          {getDiscountedPrice(mainProduct) ? (
                            <>
                              <span className="text-white/70 line-through text-sm">
                                {mainProduct.price.toLocaleString()} ₸
                              </span>
                              <span className="text-qyellow font-bold text-lg">
                                {getDiscountedPrice(mainProduct)?.toLocaleString()} ₸
                              </span>
                            </>
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {mainProduct.price.toLocaleString()} ₸
                            </span>
                          )}
                        </div>
                        {mainProduct.discountPercentage > 0 && (
                          <span className="absolute top-4 right-4 bg-qred text-white text-xs font-bold px-3 py-1 rounded-full">
                            -{mainProduct.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="xl:w-[740px] w-full h-[400px] xl:h-full bg-[#F5F5F5] rounded-lg flex items-center justify-center">
                  <p className="text-qgray">Загрузка товаров...</p>
                </div>
              )}

              {/* Right Side - Two Products */}
              <div className="flex-1 flex xl:flex-col flex-row xl:space-y-[30px] space-x-[30px] xl:space-x-0 h-full mt-[30px] xl:mt-0">
                {/* Second Product */}
                {secondProduct ? (
                  <div className="w-1/2 xl:w-full xl:h-1/2">
                    <Link href={`/product/${secondProduct.slug}`}>
                      <div className="relative w-full h-[200px] xl:h-full bg-[#F5F5F5] rounded-lg overflow-hidden group">
                        <Image
                          src={getImageUrl(secondProduct)}
                          alt={secondProduct.name || secondProduct.title}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 1280px) 50vw, 400px"
                        />
                        {/* Product Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                          <p className="text-white text-sm font-medium line-clamp-1">
                            {secondProduct.name || secondProduct.title}
                          </p>
                          <p className="text-qyellow font-bold">
                            {getDiscountedPrice(secondProduct)?.toLocaleString() ||
                              secondProduct.price.toLocaleString()}{" "}
                            ₸
                          </p>
                        </div>
                        {secondProduct.discountPercentage > 0 && (
                          <span className="absolute top-2 right-2 bg-qred text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{secondProduct.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="w-1/2 xl:w-full xl:h-1/2 bg-[#F5F5F5] rounded-lg" />
                )}

                {/* Third Product */}
                {thirdProduct ? (
                  <div className="w-1/2 xl:w-full xl:h-1/2">
                    <Link href={`/product/${thirdProduct.slug}`}>
                      <div className="relative w-full h-[200px] xl:h-full bg-[#F5F5F5] rounded-lg overflow-hidden group">
                        <Image
                          src={getImageUrl(thirdProduct)}
                          alt={thirdProduct.name || thirdProduct.title}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 1280px) 50vw, 400px"
                        />
                        {/* Product Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                          <p className="text-white text-sm font-medium line-clamp-1">
                            {thirdProduct.name || thirdProduct.title}
                          </p>
                          <p className="text-qyellow font-bold">
                            {getDiscountedPrice(thirdProduct)?.toLocaleString() ||
                              thirdProduct.price.toLocaleString()}{" "}
                            ₸
                          </p>
                        </div>
                        {thirdProduct.discountPercentage > 0 && (
                          <span className="absolute top-2 right-2 bg-qred text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{thirdProduct.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="w-1/2 xl:w-full xl:h-1/2 bg-[#F5F5F5] rounded-lg" />
                )}
              </div>
            </div>

            {/* Services Bar */}
            <div
              style={{
                backgroundImage: `url(/assets/images/service-bg.png)`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
              }}
              className="best-services w-full flex flex-col space-y-10 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center lg:h-[110px] px-10 lg:py-0 py-10 rounded-lg"
            >
              <div className="item">
                <div className="flex space-x-5 items-center">
                  <div>
                    <span>
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 36 36"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1H5.63636V24.1818H35"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                        <path
                          d="M8.72763 35.0002C10.4347 35.0002 11.8185 33.6163 11.8185 31.9093C11.8185 30.2022 10.4347 28.8184 8.72763 28.8184C7.02057 28.8184 5.63672 30.2022 5.63672 31.9093C5.63672 33.6163 7.02057 35.0002 8.72763 35.0002Z"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                        <path
                          d="M31.9073 35.0002C33.6144 35.0002 34.9982 33.6163 34.9982 31.9093C34.9982 30.2022 33.6144 28.8184 31.9073 28.8184C30.2003 28.8184 28.8164 30.2022 28.8164 31.9093C28.8164 33.6163 30.2003 35.0002 31.9073 35.0002Z"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                        <path
                          d="M34.9982 1H11.8164V18H34.9982V1Z"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                        <path
                          d="M11.8164 7.18164H34.9982"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-[15px] font-700 tracking-wide mb-1">
                      Бесплатная доставка
                    </p>
                    <p className="text-sm text-white/80">При заказе от 50 000 ₸</p>
                  </div>
                </div>
              </div>

              <div className="item">
                <div className="flex space-x-5 items-center">
                  <div>
                    <span>
                      <svg
                        width="32"
                        height="34"
                        viewBox="0 0 32 34"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M31 17.4502C31 25.7002 24.25 32.4502 16 32.4502C7.75 32.4502 1 25.7002 1 17.4502C1 9.2002 7.75 2.4502 16 2.4502C21.85 2.4502 26.95 5.7502 29.35 10.7002"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                        />
                        <path
                          d="M30.7 2L29.5 10.85L20.5 9.65"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-[15px] font-700 tracking-wide mb-1">
                      Возврат товара
                    </p>
                    <p className="text-sm text-white/80">В течение 14 дней</p>
                  </div>
                </div>
              </div>

              <div className="item">
                <div className="flex space-x-5 items-center">
                  <div>
                    <span>
                      <svg
                        width="32"
                        height="38"
                        viewBox="0 0 32 38"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.6654 18.667H9.33203V27.0003H22.6654V18.667Z"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                        <path
                          d="M12.668 18.6663V13.6663C12.668 11.833 14.168 10.333 16.0013 10.333C17.8346 10.333 19.3346 11.833 19.3346 13.6663V18.6663"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                        <path
                          d="M31 22C31 30.3333 24.3333 37 16 37C7.66667 37 1 30.3333 1 22V5.33333L16 2L31 5.33333V22Z"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-[15px] font-700 tracking-wide mb-1">
                      Безопасная оплата
                    </p>
                    <p className="text-sm text-white/80">100% защита данных</p>
                  </div>
                </div>
              </div>

              <div className="item">
                <div className="flex space-x-5 items-center">
                  <div>
                    <span>
                      <svg
                        width="32"
                        height="35"
                        viewBox="0 0 32 35"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 13H5.5C2.95 13 1 11.05 1 8.5V1H7"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                        />
                        <path
                          d="M25 13H26.5C29.05 13 31 11.05 31 8.5V1H25"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                        />
                        <path
                          d="M16 28V22"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                        />
                        <path
                          d="M16 22C11.05 22 7 17.95 7 13V1H25V13C25 17.95 20.95 22 16 22Z"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                        <path
                          d="M25 34H7C7 30.7 9.7 28 13 28H19C22.3 28 25 30.7 25 34Z"
                          stroke="#FFBB38"
                          strokeWidth="2"
                          strokeMiterlimit="10"
                          strokeLinecap="square"
                        />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-[15px] font-700 tracking-wide mb-1">
                      Качество
                    </p>
                    <p className="text-sm text-white/80">Гарантия подлинности</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
