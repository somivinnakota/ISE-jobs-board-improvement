import Link from "next/link"

export const WickedLink = ({ url, text, icon }: { url: string, text: string, icon: React.ReactNode }) => {
  return (
    <Link
      href={url}
      target="_blank"
      className={`
                  ${(url == null || url.trim() == "") ? "hidden" : "block"}
                  flex cursor-pointer flex-row items-center gap-x-2 rounded-sm border-2 border-black p-2 px-4 text-sm transition-all
                  duration-200 hover:bg-black hover:text-white dark:border-white dark:hover:text-black dark:hover:bg-white
		`}
    >
      {icon} {text}
    </Link>
  )
}
