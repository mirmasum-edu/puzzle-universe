import { notFound } from "next/navigation";
import { getGame, GAMES } from "@/lib/games";
import GameRunner from "./GameRunner";

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();
  return <GameRunner game={game} />;
}
