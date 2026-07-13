import Link from "next/link"

interface FloatingLinkProps {
  href: string
  children: React.ReactNode
}

export const FloatingLink = ({ href, children }: FloatingLinkProps) => (
  <Link
    href={href}
    className="group relative mt-3 inline-flex h-fit w-fit items-center border border-white hover:cursor-pointer focus:outline-none dark:border-black">
    <span className="inline-flex w-full transform items-center justify-center gap-x-2 self-stretch bg-black px-4 py-2 dark:ring-black text-center font-mono text-white ring-1 ring-offset-1 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 dark:bg-white dark:text-black">
      {children}
    </span>
  </Link>
)
