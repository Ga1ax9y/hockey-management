import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";


export const MatchStatsService = {

  async create(matchData: any, organizationId?: number) {
    const {
      matchId,
      playerId,
      goals,
      assists,
      shots,
      hits,
      penaltyMinutes,
      plusMinus,
      faceoffWins,
      timeOnIce
    } = matchData
    const newMatchStats = await prisma.matchStats.create({
      data: {
        matchId: Number(matchId),
        playerId: Number(playerId),
        goals: Number(goals ?? 0),
        assists: Number(assists ?? 0),
        shots: Number(shots ?? 0),
        hits: Number(hits ?? 0),
        penaltyMinutes: Number(penaltyMinutes ?? 0),
        plusMinus: Number(plusMinus ?? 0),
        faceoffWins: Number(faceoffWins ?? 0),
        timeOnIce: Number(timeOnIce ?? 0),
      }
    })

    return newMatchStats
  },

async update(id: number, matchData: any, organizationId?: number) {
    const {
      matchId,
      playerId,
      goals,
      assists,
      shots,
      hits,
      penaltyMinutes,
      plusMinus,
      faceoffWins,
      timeOnIce
    } = matchData

    const updatedMatchStats = await prisma.matchStats.update({
      where: { id },
      data: {
        ...(matchId !== undefined && { matchId: Number(matchId) }),
        ...(playerId !== undefined && { playerId: Number(playerId) }),
        ...(goals !== undefined && { goals: Number(goals) }),
        ...(assists !== undefined && { assists: Number(assists) }),
        ...(shots !== undefined && { shots: Number(shots) }),
        ...(hits !== undefined && { hits: Number(hits) }),
        ...(penaltyMinutes !== undefined && { penaltyMinutes: Number(penaltyMinutes) }),
        ...(plusMinus !== undefined && { plusMinus: Number(plusMinus) }),
        ...(faceoffWins !== undefined && { faceoffWins: Number(faceoffWins) }),
        ...(timeOnIce !== undefined && { timeOnIce: Number(timeOnIce) }),
      }
    });

    return updatedMatchStats;
  },


  async delete(id: number, organizationId?: number) {
    await prisma.matchStats.delete({
      where: { id }
    })
  },


  _transformMatchData(match: any) {
  }

}
