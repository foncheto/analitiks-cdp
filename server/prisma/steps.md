npx prisma generate
npx prisma migrate dev --name init
npm run seed
npx prisma migrate reset
