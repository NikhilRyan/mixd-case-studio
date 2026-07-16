import type { Metadata } from "next";
import { Studio } from "./Studio";

export const metadata: Metadata = {
  title: "Design Studio — MIXD.",
  description: "Build, rotate and share your exact custom phone-case design.",
};

export default function StudioPage() {
  return <Studio />;
}
