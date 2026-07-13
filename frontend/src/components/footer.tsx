import Image from "next/image"
import ISE_UL_LOGO from "/public/ise-ul-logo.png";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { NiceLink } from "./ui/nice-link";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-white font-mono dark:bg-background">
      <div className="mx-auto grid w-full max-w-screen-xl gap-x-16 gap-y-12 p-4 py-6 md:grid-cols-2 lg:grid-cols-3 lg:py-8">
        <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1 lg:pr-20">
          <Image
            src={ISE_UL_LOGO}
            width={200}
            alt="The ISE and University of Limerick logos, side-by-side."
            className="mr-6 invert dark:invert-0" />
          <p className="font-mono text-neutral-800 dark:text-neutral-50/70">
            The goal of Immersive Software Engineering is to turn curious, creative people like you into the best software engineers in the world.
          </p>
          <div className="flex flex-row gap-4">
            <NiceLink href="/" size="icon">
              <Twitter />
            </NiceLink>
            <NiceLink href="/" size="icon">
              <Facebook />
            </NiceLink>
            <NiceLink href="/" size="icon">
              <Instagram />
            </NiceLink>
            <NiceLink href="/" size="icon">
              <Linkedin />
            </NiceLink>
            <NiceLink href="/" size="icon">
              <Youtube />
            </NiceLink>
          </div>
        </div>

        <div>
          <h3 className="pb-2 text-lg font-bold">About ISE</h3>
          <div className="grid grid-cols-2 text-neutral-700 dark:text-neutral-50/70 lg:grid-cols-1">
            <Link className="hover:underline" href="/">Why Choose ISE?</Link>
            <Link className="hover:underline" href="/">The Specifics</Link>
            <Link className="hover:underline" href="/">Student Projects</Link>
            <Link className="hover:underline" href="/">Entrance Submission</Link>
            <Link className="hover:underline" href="/">FAQ</Link>
            <Link className="hover:underline" href="/">Meet The Team</Link>
            <Link className="hover:underline" href="/">News and events</Link>
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className="pb-2 text-lg font-bold">Address</h3>
          <h3 className="pb-2">University of Limerick</h3>
          <span>Block 2</span>
          <span>International Business Centre</span>
          <span>University of Limerick</span>
          <span>Castletroy</span>
          <span>V94 Y985</span>
        </div>
      </div>
    </footer>
  )
}
