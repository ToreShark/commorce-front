//app>dashboard>page.tsx
"use client";

import { useContext, useEffect, useState } from "react";
import AuthContext from "../lib/AuthContext";
import { getCategories } from "../lib/data";
import CategoryLoader from "./categoryLoader";
import List from "./list/page";
import Home from "./home/page";


export default function Page() {
    return (
        <div>
          {/* <h1>Dashboard Page</h1> */}
          {/* <CategoryLoader /> */}
          <Home />
          <List />
        </div>
      );
}