import type { Metadata } from "next";
import { HomePage } from "./home/HomePage";

export const metadata: Metadata = {
  title: "MIXD. — Custom phone cases, made by you",
  description: "Create, preview and share a print-ready custom phone case in minutes. Made by you, printed by us.",
};

export default function Home() {
  return <HomePage />;
}
