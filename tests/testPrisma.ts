import { PrismaClient, User } from '../prisma/generated/client'
import { uploadTrainImageSet } from '../src/utils/s3/client';


const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    // const user:User = await prisma.user.update({
    //   where: {
    //     id: "clqcfvorf0004tr6pqajn8bhc"
    //   },
    //   data: {
    //     userStatus: 2,
    //     playCount: 0,
    //     currentJobId: null
    //   },
    // })
    // await sendMail(String(user.email), "메리 댕냥스마스!", `선물이 도착했어요! \n\n www.pets-mas.com/clqcfvorf0004tr6pqajn8bhc`)
    console.log('All users:', users);

    initializeUser("clqcfvorf0004tr6pqajn8bhc")
  }


async function initializeUser(userId: string) {
  const user:User = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      userStatus: 0,
      playCount: 0,
      inferSuccess:0,
      currentJobId: null
    },
  })
  console.log(user)
  return user
}

async function deleteAllGenImages() {
    // try {
    //   const deleteResult = await prisma.genImage.deleteMany({});
    //   console.log(`Deleted ${deleteResult.count} genImage records.`);
    // } catch (error) {
    //   console.error('Error deleting genImage records:', error);
    // }
    const users = await prisma.user.findMany({
      include: {
        trainImageSet: true // Lora 객체를 포함하여 가져옵니다.
      }
    }
    );
    const admin:User = users[0]
    console.log(users)
  }

async function findtrainImageSet(zipfilePath:string) {
  return await prisma.trainImageSet.findFirst({
      where: {
        zipPath: zipfilePath,
      },
      include: {
        lora: true // Lora 객체를 포함하여 가져옵니다.
      }
    })
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
