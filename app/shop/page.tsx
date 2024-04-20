"use client";
import Link from "next/link";
import { fetchProducts } from "../lib/data";
import ShopPageComponent from "../ui/categoryDetail";

export default async function ShopPage() {
    const products = await fetchProducts() || [];

    return (
        <>
            <ShopPageComponent products={products} />
        </>
    )
}
