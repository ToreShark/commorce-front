//app/sendcode/page.tsx
import { Suspense } from "react";
import SendCode from "../@auth/(.)sendcode/sendcode";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendCode />
    </Suspense>
  );
}
