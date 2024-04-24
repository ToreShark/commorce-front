import Link from "@/node_modules/next/link";

export function Modal({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <Link href="/">Close modal</Link> */}
      <div>{children}</div>
    </>
  );
}
