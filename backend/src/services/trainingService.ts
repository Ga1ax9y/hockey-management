import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";


export const TrainingService = {
  async findAll({ pagination, organizationId }: any) {
    const { skip, limit } = pagination
    const where: Prisma.TrainingWhereInput = { team: { organizationId } };

    const [trainings, total] = await Promise.all([
      prisma.training.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          startTime: 'desc'
        },
        include: {
          _count: { select: { playerStats: true } }
        }
      }),
      prisma.training.count({ where })
    ])

    return {
      trainings,
      total
    }
  },

  async findById(id: number, includeStats: boolean) {
    const training = await prisma.training.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            league: true,
            season: true,
            players: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true
                // TODO: number: true
              },
              orderBy: {
                lastName: "asc"
              }
            }
          }
        },
        ...(includeStats && {
          playerStats: {
            include: {
              player: {
                select: {
                  firstName: true,
                  lastName: true,
                  middleName: true,
                  position: true,
                  currentTeamId: true
                }
              }
            },
            orderBy: {
              player: { lastName: "asc" }
            }
          },

        })
      }
    })
    if (!training) return null

    return training
  },

  async create(matchData: any, organizationId?: number) {
    const {startTime, endTime,  teamId, coachId, ...rest} = matchData
    const newTraining = await prisma.training.create({
      data: {
        ...rest,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        teamId: Number(teamId),
        coachId: Number(coachId),
      }
    })

    return newTraining
  },

async update(id: number, matchData: any, organizationId?: number) {
    const { startTime, endTime, teamId, coachId, ...rest } = matchData;

    const updatedTraining = await prisma.training.update({
      where: { id },
      data: {
        ...rest,

        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { startTime: new Date(endTime) }),
        ...(teamId !== undefined && { teamId: Number(teamId) }),
        ...(coachId !== undefined && { coachId: Number(coachId) }),
      }
    });

    return updatedTraining;
  },


  async delete(id: number, organizationId?: number) {
    await prisma.training.delete({
      where: { id }
    })
  },


//   _transformTrainingData(training: any) {
//     return {
//       ...training,
//       isWin: training.myScore > training.opponentScore,
//       isLoss: training.myScore < training.opponentScore,
//       isDraw: training.myScore === training.opponentScore && training.status === 'finished',
//       teamTotals: training.playerStats ? {
//         shots: training.playerStats.reduce((sum: number, s: any) => sum + s.shots, 0),
//         hits: training.playerStats.reduce((sum: number, s: any) => sum + s.hits, 0),
//         pim: training.playerStats.reduce((sum: number, s: any) => sum + s.penaltyMinutes, 0)
//       } : undefined
//     };
//   }

}
