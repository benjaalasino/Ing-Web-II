import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './common/config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';
import { ProfileModule } from './profile/profile.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BudgetsModule } from './budgets/budgets.module';
import { SavingsModule } from './savings/savings.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    EmailModule,
    HealthModule,
    ProfileModule,
    ExpensesModule,
    BudgetsModule,
    SavingsModule,
    RecommendationsModule,
    UsersModule,
    TicketsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
