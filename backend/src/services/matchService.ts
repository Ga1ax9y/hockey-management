import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";


export const MatchService = {
    async findAll({ pagination, organizationId }: any) {
        const { skip, limit } = pagination
        const where: Prisma.MatchWhereInput = { myTeam: { organizationId } };

        const [matches, total] = await Promise.all([
            prisma.match.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    matchDate: 'desc'
                },
                include: {
                    _count: { select: { playerStats: true } }
                }
            }),
            prisma.match.count({ where })
        ])

        return {
            matches,
            total
        }
    },

    async findById(id: number, includeStats: boolean) {
        const match = await prisma.match.findUnique({
            where: { id },
            include: {
                myTeam: {
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
        if (!match) return null

        return match
    },

    async create(matchData: any, organizationId?: number) {
        const { myTeamId, matchDate, status = 'scheduled', ...rest } = matchData
        const newMatch = await prisma.match.create({
            data: {
                ...rest,
                status,
                matchDate: new Date(matchDate),
                myTeamId: Number(myTeamId),
                isHomeGame: Boolean(rest.isHomeGame),
            }
        })

        return newMatch
    },

    async update(id: number, matchData: any, organizationId?: number) {
        const { matchDate, myTeamId, isHomeGame, ...rest } = matchData;

        const updatedMatch = await prisma.match.update({
            where: { id },
            data: {
                ...rest,

                ...(matchDate !== undefined && { matchDate: new Date(matchDate) }),
                ...(myTeamId !== undefined && { myTeamId: Number(myTeamId) }),
                ...(isHomeGame !== undefined && { isHomeGame: Boolean(isHomeGame) }),
            }
        });

        return updatedMatch;
    },


    async delete(id: number, organizationId?: number) {
        await prisma.match.delete({
            where: { id }
        })
    },

    async complete(id: number, scores: { myScore: number, opponentScore: number }, organizationId?: number) {
        const completedMatch = await prisma.match.update({
            where: { id },
            data: {
                myScore: Number(scores.myScore),
                opponentScore: Number(scores.opponentScore),
            }
        })

        return completedMatch
    },

    async autoCloseOldMatches() {
        const twoHoursAgo = new Date();
        twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

        return await prisma.match.updateMany({
            where: {
                status: 'scheduled',
                matchDate: { lt: twoHoursAgo },
            },
            data: { status: 'finished' },
        });
    },

    _transformMatchData(match: any) {
        return {
            ...match,
            isWin: match.myScore > match.opponentScore,
            isLoss: match.myScore < match.opponentScore,
            isDraw: match.myScore === match.opponentScore && match.status === 'finished',
            teamTotals: match.playerStats ? {
                shots: match.playerStats.reduce((sum: number, s: any) => sum + s.shots, 0),
                hits: match.playerStats.reduce((sum: number, s: any) => sum + s.hits, 0),
                pim: match.playerStats.reduce((sum: number, s: any) => sum + s.penaltyMinutes, 0)
            } : undefined
        };
    }

}
