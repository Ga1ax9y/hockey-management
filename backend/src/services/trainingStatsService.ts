import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";


export const TrainingStatsService = {

  async create(matchData: any, organizationId?: number) {
    const {
      trainingId,
      playerId,
      coachRating,
      description,
    } = matchData
    const newTrainingStats = await prisma.trainingStats.create({
      data: {
        trainingId: Number(trainingId),
        playerId: Number(playerId),
        coachRating: Number(coachRating ?? 10),
        description
      }
    })

    return newTrainingStats
  },

async update(id: number, matchData: any, organizationId?: number) {
    const {
      trainingId,
      playerId,
      coachRating,
      description,
    } = matchData

    const updatedTrainingStats = await prisma.trainingStats.update({
      where: { id },
      data: {
        ...(trainingId !== undefined && { trainingId: Number(trainingId) }),
        ...(playerId !== undefined && { playerId: Number(playerId) }),
        ...(coachRating !== undefined && { coachRating: Number(coachRating) }),
        ...(description !== undefined && { description }),
      }
    });

    return updatedTrainingStats;
  },


  async delete(id: number, organizationId?: number) {
    await prisma.trainingStats.delete({
      where: { id }
    })
  },


  _transformMatchData(match: any) {
  }

}
