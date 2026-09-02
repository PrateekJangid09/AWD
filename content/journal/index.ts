import type { ComponentType } from "react";
import AccentColours from "./how-many-accent-colours-websites-use";
import HeadingSizes from "./website-heading-sizes-by-industry";
import StackAndStyle from "./framer-vs-webflow-vs-nextjs-vs-astro";

/** Article bodies, keyed by the slug in lib/journal.ts. */
export const BODIES: Record<string, ComponentType> = {
  "framer-vs-webflow-vs-nextjs-vs-astro": StackAndStyle,
  "website-heading-sizes-by-industry": HeadingSizes,
  "how-many-accent-colours-websites-use": AccentColours,
};
