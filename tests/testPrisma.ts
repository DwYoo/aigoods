import { PrismaClient } from '../prisma/generated/client'
import { uploadTrainImageSet } from '../src/s3/client';

const prisma = new PrismaClient();

async function main() {
    // const users = await prisma.user.findMany();
    // console.log('All users:', users);

    // 새 사용자 생성
    // const newUser = await prisma.user.create({
    //     data: {
    //     name: 'testuser',
    //     email: 'testuser@example.com',
    //     // 다른 필드들...
    //     },
    // });
    // console.log('Created new user:', newUser);
    // await deleteAllGenImages()
    const trainImageSet = await findtrainImageSet('users/990a8a81-ad57-404f-af5a-41a289650611/train/1702588405834_images.zip')
    // const trainImageSet = await prisma.trainImageSet.findMany()
    console.log(trainImageSet)
  }
async function deleteAllGenImages() {
    try {
      const deleteResult = await prisma.genImage.deleteMany({});
      console.log(`Deleted ${deleteResult.count} genImage records.`);
    } catch (error) {
      console.error('Error deleting genImage records:', error);
    }
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
