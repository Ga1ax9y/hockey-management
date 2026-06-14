import type { MatchWhereInput, TrainingWhereInput } from "../generated/prisma/models";
import { prisma } from "../lib/prisma";
import { AppError, commonErrorDict } from "../types/AppError";

export const buildMatchWhereClause = (query: any, organizationId: number) => {
    const where: MatchWhereInput = {
        myTeam: { organizationId },
    };

    const { teamId, startDate, endDate, matchStatus, opponentName } = query;

    if (teamId) where.myTeamId = Number(teamId);

    if (startDate || endDate) {
        where.matchDate = {};
        if (startDate) where.matchDate.gte = new Date(startDate as string);
        if (endDate) where.matchDate.lte = new Date(endDate as string);
    }

    if (matchStatus) where.status = matchStatus as string;

    if (opponentName) {
        where.opponentName = {
            contains: opponentName as string,
            mode: "insensitive",
        };
    }

    return where;
};

export const buildTrainingWhereClause = (
    query: any,
    organizationId: number,
) => {
    const where: TrainingWhereInput = {
        team: { organizationId },
    };

    const { teamId, startDate, endDate, trainingType } = query;

    if (teamId) where.teamId = Number(teamId);

    if (startDate || endDate) {
        where.startTime = {};
        if (startDate) where.startTime.gte = new Date(startDate as string);
        if (endDate) where.startTime.lte = new Date(endDate as string);
    }

    if (trainingType) where.trainingType = trainingType as string;

    return where;
};

export const ScheduleService = {
    async findAll({query, user, organizationId, teamIdFromParams, pagination}: any) {
        const {skip, limit} = pagination
        let targetTeamId: number;

        const isStaff = ["ADMIN", "MANAGER"].includes(user!.role.code);

        if (!isStaff && teamIdFromParams !== user?.teamId) {
            throw new AppError(
                commonErrorDict.unauthorized.name,
                commonErrorDict.unauthorized.httpCode,
                "У вас нет прав на просмотр расписания этой команды",
                "Доступ запрещен",
            )
        }
        if (isStaff) {
            targetTeamId = teamIdFromParams;
        } else {
            targetTeamId = user!.teamId;
        }

        if (!targetTeamId) {
            throw new AppError(
                commonErrorDict.badRequest.name,
                commonErrorDict.badRequest.httpCode,
                "Не указан ID команды",
                "Ошибка при получении расписания",
            )
        }
        const effectiveQuery = {
            ...query,
            teamId: targetTeamId,
        };
        const matchWhere = buildMatchWhereClause(effectiveQuery, organizationId);
        const trainingWhere = buildTrainingWhereClause(
            effectiveQuery,
            organizationId,
        );
        const [matches, trainings, totalMatches, totalTrainings] = await Promise.all([
            prisma.match.findMany({
                where: matchWhere,
                orderBy: { matchDate: "asc" },
                take: limit+skip,
            }),
            prisma.training.findMany({
                where: trainingWhere,
                orderBy: { startTime: "asc" },
                take: limit+skip,
            }),
            prisma.match.count({ where: matchWhere }),
            prisma.training.count({ where: trainingWhere }),
        ]);
        const allEvents = [
            ...matches.map((m) => ({
                id: m.id,
                title: `Матч: ${m.opponentName}`,
                start: m.matchDate,
                type: "MATCH",
                sortDate: new Date(m.matchDate).getTime(),
                status: m.status,
                extendedProps: {
                    location: m.location,
                    isHomeGame: m.isHomeGame,
                    score: `${m.myScore}:${m.opponentScore}`,
                    myScore: m.myScore,
                    opponentName: m.opponentName,
                    matchType: m.matchType,
                    opponentScore: m.opponentScore,
                },
            })),
            ...trainings.map((t) => ({
                id: t.id,
                title: `Тренировка: ${t.trainingType}`,
                start: t.startTime,
                end: t.endTime,
                type: "TRAINING",
                sortDate: new Date(t.startTime).getTime(),
                extendedProps: {
                    location: t.location,
                    trainingType: t.trainingType,
                    coachId: t.coachId,
                },
            })),
        ]
        const paginatedEvents = allEvents
        .sort((a, b) => b.sortDate - a.sortDate)
        .slice(skip, skip + limit);

        return {
            events: paginatedEvents,
            total: totalMatches+totalTrainings
        }
    }
}
