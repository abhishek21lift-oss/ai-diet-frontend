import app from './app';
import { prisma } from './config/database';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🏋️  619 Fitness Studio API`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔑 Health: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
