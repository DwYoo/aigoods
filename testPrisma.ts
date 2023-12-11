import { PrismaClient } from './prisma/generated/client'

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('All users:', users);

    // 새 사용자 생성
    const newUser = await prisma.user.create({
        data: {
        name: 'Alice',
        email: 'alice@example.com',
        // 다른 필드들...
        },
    });
    console.log('Created new user:', newUser);

    // 모든 사용자 조회

    // 특정 사용자 업데이트
    const updatedUser = await prisma.user.update({
        where: { email: 'alice@example.com' },
        data: { name: 'Alice Wonderland' },
    });
    console.log('Updated user:', updatedUser);

    // 사용자 삭제
    const deletedUser = await prisma.user.delete({
        where: { email: 'alice@example.com' },
    });
    console.log('Deleted user:', deletedUser);
    }

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
