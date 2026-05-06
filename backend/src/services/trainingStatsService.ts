import type { Prisma } from "../generated/prisma/client";
import type { TrainingStatsWhereInput } from "../generated/prisma/models";
import { prisma } from "../lib/prisma";

const buildTrainingStatsWhereClause = (query: any, playerId: number) => {
    const where: TrainingStatsWhereInput = {}

    const { goals } = query

    where.playerId = Number(playerId)


    return where
}

export const TrainingStatsService = {

  async findByPlayer({ playerId, pagination, filters }: any) {
    const { skip, limit } = pagination
    const where = buildTrainingStatsWhereClause(filters, playerId)

    const [trainingStats, total] = await Promise.all([
      prisma.trainingStats.findMany({
        where,
        include: {
          player: { select: { firstName: true, lastName: true } },
          training: { select: { id: true, startTime: true, trainingType: true,
            coach: { select: {fullName: true}} } },
        },
        skip,
        take: limit,
        orderBy: {
          training: {
            startTime: filters.order || "desc"
          }
          // [filters.sortBy || ]: filters.order || "desc"
        }
      }),
      prisma.trainingStats.count({ where })
    ])
    return {
      trainingStats,
      total
    }
  },
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
