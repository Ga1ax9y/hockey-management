import { prisma } from "../lib/prisma";

export const updateFinishedMatches = async () => {
  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

  return await prisma.match.updateMany({
    where: {
      status: 'scheduled',
      matchDate: {
        lt: twoHoursAgo,
      },
    },
    data: {
      status: 'finished',
    },
  });
};
