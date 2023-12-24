import { PrismaClient, User } from './prisma/generated/client'

const prisma = new PrismaClient();

async function main() {
    const trainimageset = await prisma.trainImageSet.findMany(
        {where: {
            userId: 'clqiwzl21000476qx3fea4l8w'
        }
    }
    );    
    console.log('All users:', trainimageset);
    }


main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
