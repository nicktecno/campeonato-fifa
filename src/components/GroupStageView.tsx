"use client";

import { Tournament } from "@/lib/types";
import { MatchCard } from "./MatchCard";
import { calculateStandings } from "@/lib/groups";
import { getTeams } from "@/lib/data";
import { PlayerAvatar } from "./MatchCard";
import { TeamFlag } from "./TeamFlag";

interface GroupStageViewProps {
  tournament: Tournament;
}

export function GroupStageView({ tournament }: GroupStageViewProps) {
  const groupMatches = tournament.matches.filter((m) => m.phase === "group");
  const teams = getTeams(tournament.teamType);

  return (
    <div className="space-y-8 p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {tournament.groups.map((group) => {
          const standings = calculateStandings(group, tournament.matches);
          const matches = groupMatches
            .filter((m) => m.groupId === group.id)
            .sort((a, b) => a.position - b.position);

          return (
            <div
              key={group.id}
              className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="bg-gold/10 border-b border-gold/20 px-4 py-3">
                <h3 className="font-bold text-gold text-lg">{group.name}</h3>
              </div>

              <div className="p-4">
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="text-white/40 text-xs uppercase">
                      <th className="text-left pb-2">#</th>
                      <th className="text-left pb-2">Jogador</th>
                      <th className="text-center pb-2">J</th>
                      <th className="text-center pb-2">V</th>
                      <th className="text-center pb-2">E</th>
                      <th className="text-center pb-2">D</th>
                      <th className="text-center pb-2">SG</th>
                      <th className="text-center pb-2 font-bold text-gold">
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, i) => {
                      const player = tournament.players.find(
                        (p) => p.id === s.playerId
                      );
                      const team = player
                        ? teams.find((t) => t.id === player.teamId)
                        : null;
                      const qualified = i < 2;

                      return (
                        <tr
                          key={s.playerId}
                          className={`border-t border-white/5 ${qualified ? "bg-gold/5" : ""}`}
                        >
                          <td className="py-2 text-white/40">{i + 1}</td>
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <PlayerAvatar
                                player={player ?? null}
                                team={team ?? undefined}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <span className="truncate font-medium block">
                                  {player?.name}
                                </span>
                                {team && (
                                  <span className="flex items-center gap-1 text-[10px] text-white/40">
                                    <TeamFlag team={team} size="xs" />
                                    {team.name}
                                  </span>
                                )}
                              </div>
                              {qualified && (
                                <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded">
                                  ✓
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-2">{s.played}</td>
                          <td className="text-center py-2">{s.wins}</td>
                          <td className="text-center py-2">{s.draws}</td>
                          <td className="text-center py-2">{s.losses}</td>
                          <td className="text-center py-2">
                            {s.goalDifference > 0 ? "+" : ""}
                            {s.goalDifference}
                          </td>
                          <td className="text-center py-2 font-bold text-gold">
                            {s.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="space-y-2">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
                    Partidas
                  </p>
                  {matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      players={tournament.players}
                      teamType={tournament.teamType}
                      tournamentId={tournament.id}
                      compact
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
