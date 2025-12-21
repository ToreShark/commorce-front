"use client";

import Link from "next/link";
import useCountDown from "./useCountDown";

interface CampaignCountDownProps {
  className?: string;
  targetDate: string;
}

export default function CampaignCountDown({
  className,
  targetDate,
}: CampaignCountDownProps) {
  const { days, hours, minutes, seconds } = useCountDown(targetDate);

  return (
    <div className={`w-full lg:h-[400px] ${className || ""}`}>
      <div className="container-x mx-auto h-full">
        <div className="items-center h-full">
          <div
            className="campaign-countdown h-full w-full rounded-lg overflow-hidden"
            style={{
              background: `url(/assets/images/campaign-cover-countdown-4.jpg) no-repeat`,
              backgroundSize: "cover",
            }}
          >
            <Link href="/shop">
              <div className="w-full h-full xl:p-12 p-5 flex flex-col justify-center">
                {/* Countdown */}
                <div className="countdown-wrapper w-full flex space-x-3 sm:space-x-[23px] mb-6 sm:mb-10">
                  <div className="countdown-item">
                    <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[60px] h-[60px] rounded-full bg-white flex justify-center items-center shadow-lg">
                      <span className="font-700 sm:text-[30px] text-[18px] text-[#EB5757]">
                        {days}
                      </span>
                    </div>
                    <p className="sm:text-[18px] text-[12px] font-500 text-center leading-8 text-qblack">
                      Дней
                    </p>
                  </div>
                  <div className="countdown-item">
                    <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[60px] h-[60px] rounded-full bg-white flex justify-center items-center shadow-lg">
                      <span className="font-700 sm:text-[30px] text-[18px] text-[#2F80ED]">
                        {hours}
                      </span>
                    </div>
                    <p className="sm:text-[18px] text-[12px] font-500 text-center leading-8 text-qblack">
                      Часов
                    </p>
                  </div>
                  <div className="countdown-item">
                    <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[60px] h-[60px] rounded-full bg-white flex justify-center items-center shadow-lg">
                      <span className="font-700 sm:text-[30px] text-[18px] text-[#219653]">
                        {minutes}
                      </span>
                    </div>
                    <p className="sm:text-[18px] text-[12px] font-500 text-center leading-8 text-qblack">
                      Минут
                    </p>
                  </div>
                  <div className="countdown-item">
                    <div className="countdown-number sm:w-[100px] sm:h-[100px] w-[60px] h-[60px] rounded-full bg-white flex justify-center items-center shadow-lg">
                      <span className="font-700 sm:text-[30px] text-[18px] text-[#EF5DA8]">
                        {seconds}
                      </span>
                    </div>
                    <p className="sm:text-[18px] text-[12px] font-500 text-center leading-8 text-qblack">
                      Секунд
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="countdown-title mb-4">
                  <h2 className="text-[28px] sm:text-[44px] text-qblack font-bold">
                    Распродажа!
                  </h2>
                  <p className="text-[14px] sm:text-[18px] text-qblack leading-7">
                    Успейте приобрести товары со скидкой до 50%
                    <br className="hidden sm:block" /> Предложение ограничено!
                  </p>
                </div>

                {/* Button */}
                <div className="w-[140px] h-10 border-b-2 border-qblack hover:border-qyellow transition-colors">
                  <div className="h-full inline-flex space-x-2 items-center">
                    <span className="text-sm font-600 tracking-wide leading-7 text-qblack">
                      Купить сейчас
                    </span>
                    <span>
                      <svg
                        width="7"
                        height="11"
                        viewBox="0 0 7 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="2.08984"
                          y="0.636719"
                          width="6.94219"
                          height="1.54271"
                          transform="rotate(45 2.08984 0.636719)"
                          fill="#1D1D1D"
                        />
                        <rect
                          x="7"
                          y="5.54492"
                          width="6.94219"
                          height="1.54271"
                          transform="rotate(135 7 5.54492)"
                          fill="#1D1D1D"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
