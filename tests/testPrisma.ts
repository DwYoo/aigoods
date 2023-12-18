import { PrismaClient, User } from '../prisma/generated/client'
import { uploadTrainImageSet } from '../src/s3/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('All users:', users);

    // await prisma.user.update({
    //   where: {
    //     id: users[0].id
    //   },
    //   data: {
    //     playCount: 0,
    //   },
    // })
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
