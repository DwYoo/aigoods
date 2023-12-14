import { PrismaClient } from '../prisma/generated/client'

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('All users:', users);

    // 새 사용자 생성
    const newUser = await prisma.user.create({
        data: {
        name: 'testuser',
        email: 'testuser@example.com',
        // 다른 필드들...
        },
    });
    console.log('Created new user:', newUser);
  }
  

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
