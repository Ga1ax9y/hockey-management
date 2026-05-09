import { prisma } from "../lib/prisma";

export const ReadinessService = {
    async findByPlayer({ playerId, pagination }: any) {
        const { skip, limit } = pagination

        const [readinessIndices, total] = await Promise.all([
            prisma.playerReadinessIndex.findMany({
                where: { playerId: Number(playerId) },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.playerReadinessIndex.count({
                where: { playerId: Number(playerId) }
            })
        ])

        return {
            readinessIndices,
            total
        }
    },

    async getTeamLatestIndices({ teamId, pagination }: any) {
        const { skip, limit } = pagination
        const [latestIndices, total] = await Promise.all([
            prisma.playerReadinessIndex.findMany({
                where: {
                    player: {
                        currentTeamId: Number(teamId)
                    }
                },
                skip,
                take: limit,
                distinct: ['playerId'],
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    player: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }),
            prisma.playerReadinessIndex.count({
                where: {
                    player: {
                        currentTeamId: Number(teamId)
                    }
                }
            })
        ])

        return {
            latestIndices,
            total
        };
    },
    async calculatePlayerReadiness(playerId: number) {
        const now = new Date();

        const activeInjury = await prisma.medicalHistory.findFirst({
            where: {
                playerId,
                AND: [
                    { injuryDate: { lte: now } },
                    {
                        OR: [
                            { recoveryDate: null },
                            { recoveryDate: { gt: now } }
                        ]
                    }
                ]
            },
            orderBy: { injuryDate: 'desc' }
        });

        if (activeInjury) {
            return {
                readinessValue: 0,
                confidenceLevel: "High",
                status: activeInjury.status,
            };
        }

        const periodLimit = new Date();
        periodLimit.setDate(periodLimit.getDate() - 14);

        const [trainingStats, matchStats] = await Promise.all([
            prisma.trainingStats.findMany({
                where: { playerId, createdAt: { gte: periodLimit } }
            }),
            prisma.matchStats.findMany({
                where: { playerId, createdAt: { gte: periodLimit } }
            })
        ]);

        const coachScore = trainingStats.length > 0
            ? (trainingStats.reduce((acc, v) => acc + (v.coachRating || 0), 0) / trainingStats.length) * 10
            : 0;

        const performanceScore = matchStats.length > 0
            ? matchStats.reduce((acc, m) => {
                const gamePoint =
                    (m.goals * 3) +
                    (m.assists * 2) +
                    (m.plusMinus) +
                    (m.hits * 0.5) +
                    (m.faceoffWins * 0.1) +
                    (m.timeOnIce / 60) -
                    (m.penaltyMinutes * 0.5);
                return acc + gamePoint;
            }, 0) / matchStats.length
            : 0;

        const normalizedPerf = Math.min((performanceScore / 15) * 100, 100);

        const finalIndex = (coachScore * 0.7) + (normalizedPerf * 0.3);

        const dataPoints = trainingStats.length + matchStats.length;
        let confidence = "Low";
        if (dataPoints > 10) confidence = "High";
        else if (dataPoints > 5) confidence = "Medium";

        return {
            readinessValue: Number(Math.max(0, finalIndex).toFixed(2)),
            confidenceLevel: confidence,
            status: "Healthy"
        };
    },

    async savePlayerIndex(playerId: number) {
        const stats = await this.calculatePlayerReadiness(playerId);

        const readinessIndex = await prisma.playerReadinessIndex.create({
            data: {
                playerId,
                readinessValue: stats.readinessValue,
                confidenceLevel: stats.confidenceLevel,
            }
        });

        return readinessIndex;
    },
    async refreshTeamReadiness(teamId: number) {
        const players = await prisma.player.findMany({ where: { currentTeamId: teamId } });
        const readinessIndices = [];

        for (const player of players) {
            const data = await this.calculatePlayerReadiness(player.id);
            const saved = await prisma.playerReadinessIndex.create({
                data: {
                    playerId: player.id,
                    readinessValue: data.readinessValue,
                    confidenceLevel: data.confidenceLevel,
                }
            });
            readinessIndices.push(saved);
        }
        return readinessIndices;
    }
}
