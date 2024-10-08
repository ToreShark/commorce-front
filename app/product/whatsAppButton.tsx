'use client'

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import "@/app/product/new/whatsApp.scss";


const WhatsAppButton = ({ product }: { product: any } ) => {
  const pathname = usePathname();
  const productUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://next.crysshop.kz'}${pathname}`;
  const message = `Я хочу сделать заказ: ${product.name} - ${productUrl}`;

  return (
    <a 
      href={`https://wa.me/77058887876?text=${encodeURIComponent(message)}`} 
      target="_blank" 
      rel="noopener noreferrer"
      // className="flex items-center justify-center w-full md:w-auto p-4 md:p-2 bg-green-500 hover:bg-green-600 transition-colors text-white md:rounded-full"
      className="whatsapp-button"
    >
      <Image src="/whatsapp (1).png" alt="WhatsApp" width={32} height={32} className="mr-2 md:mr-0" />
    </a>
  );
}

export default WhatsAppButton;