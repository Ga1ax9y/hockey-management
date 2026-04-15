import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";


export const TrainingStatsService = {

  async create(trainingData: any, organizationId?: number) {
    const {
      trainingId,
      playerId,
      coachRating,
      description,
    } = trainingData
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

async update(id: number, trainingData: any, organizationId?: number) {
    const {
      trainingId,
      playerId,
      coachRating,
      description,
    } = trainingData

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

    async upsert(trainingData: any, organizationId?: number) {
      const {
        trainingId,
        playerId,
        coachRating,
        description,
      } = trainingData

      return await prisma.trainingStats.upsert({
        where: {
          trainingId_playerId: {
            trainingId: Number(trainingId),
            playerId: Number(playerId),
          },
        },
        update: {
        ...(trainingId !== undefined && { trainingId: Number(trainingId) }),
        ...(playerId !== undefined && { playerId: Number(playerId) }),
        ...(coachRating !== undefined && { coachRating: Number(coachRating) }),
        ...(description !== undefined && { description }),
        },
        create: {
          trainingId: Number(trainingId),
          playerId: Number(playerId),
          coachRating: Number(coachRating ?? 10),
          description
        },
      });
    },


  async delete(id: number, organizationId?: number) {
    await prisma.trainingStats.delete({
      where: { id }
    })
  },


  _transformTrainingData(training: any) {
  }

}
