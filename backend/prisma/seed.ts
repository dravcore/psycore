import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const hashedPassword = await bcrypt.hash('test123456', 10);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@psycore.com' },
    update: {},
    create: {
      email: 'test@psycore.com',
      username: 'Test User',
      password: hashedPassword,
    },
  });

  console.log('✅ Created test user:', { 
    email: testUser.email, 
    username: testUser.username,
    id: testUser.id 
  });

  // Create a demo survey
  const demoSurvey = await prisma.survey.upsert({
    where: { id: 'demo-survey-id' },
    update: {},
    create: {
      id: 'demo-survey-id',
      title: 'Demo Psikolojik Değerlendirme Anketi',
      description: 'Bu bir demo ankettir. Genel ruh halinizi ve stres seviyenizi değerlendirmek için tasarlanmıştır.',
      creatorId: testUser.id,
      isActive: true,
      questions: {
        create: [
          {
            text: 'Son bir hafta içinde kendinizi nasıl hissettiniz?',
            type: 'CHOICE',
            options: ['Çok İyi', 'İyi', 'Normal', 'Kötü', 'Çok Kötü'],
            order: 1,
            required: true,
          },
          {
            text: 'Stres seviyenizi 1-10 arasında değerlendirir misiniz?',
            type: 'RANGE',
            options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            order: 2,
            required: true,
          },
          {
            text: 'Günlük aktivitelerinizi yapmakta zorluk çekiyor musunuz?',
            type: 'CHOICE',
            options: ['Hiç', 'Nadiren', 'Bazen', 'Sıklıkla', 'Her Zaman'],
            order: 3,
            required: true,
          },
          {
            text: 'Herhangi bir ek bilgi paylaşmak ister misiniz?',
            type: 'TEXT',
            options: [],
            order: 4,
            required: false,
          },
        ],
      },
    },
  });

  console.log('✅ Created demo survey:', { 
    title: demoSurvey.title, 
    id: demoSurvey.id 
  });

  // Create some demo responses
  const demoResponses = [
    {
      surveyId: demoSurvey.id,
      responses: [
        { questionId: '1', answer: 'İyi' },
        { questionId: '2', answer: '5' },
        { questionId: '3', answer: 'Bazen' },
        { questionId: '4', answer: 'Genel olarak kendimi iyi hissediyorum.' },
      ],
    },
    {
      surveyId: demoSurvey.id,
      responses: [
        { questionId: '1', answer: 'Normal' },
        { questionId: '2', answer: '7' },
        { questionId: '3', answer: 'Sıklıkla' },
        { questionId: '4', answer: 'İş yoğunluğundan dolayı biraz stresim var.' },
      ],
    },
    {
      surveyId: demoSurvey.id,
      responses: [
        { questionId: '1', answer: 'Çok İyi' },
        { questionId: '2', answer: '3' },
        { questionId: '3', answer: 'Hiç' },
        { questionId: '4', answer: 'Her şey yolunda gidiyor!' },
      ],
    },
  ];

  // Note: We can't create responses without question IDs from the database
  // This would require fetching the created questions first
  console.log('ℹ️  Skipping demo responses (requires actual question IDs from database)');

  console.log('\n✨ Seeding completed successfully!\n');
  console.log('📝 Test Credentials:');
  console.log('   Email: test@psycore.com');
  console.log('   Password: test123456');
  console.log('\n🚀 You can now start the backend and frontend to test!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
