import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Index,
  ForeignKey,
  BelongsTo,
  HasMany,
  BeforeCreate,
  AfterUpdate,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import UserModel from '@/shared/database/models/user.model';
import SavingsContributionModel from '@/shared/database/models/saving-contribution.model';
import TransactionModel from '@/shared/database/models/transaction.model';

@Table({
  tableName: 'savings_goals',
  timestamps: false,
  underscored: true,
  modelName: 'SavingsGoal',
})
export default class SavingsGoalModel extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Index
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  targetAmount!: number; // in kobo

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: true,
  })
  currentAmount!: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    defaultValue: 0,
    allowNull: true,
  })
  interestRate!: number; // stored as decimal, cast if needed

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  durationDays!: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  startDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  targetDate!: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  })
  isAutoDebit!: boolean;

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: true,
  })
  autoDebitAmount!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
    allowNull: true,
  })
  autoDebitDay!: number;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'active',
    allowNull: true,
  })
  status!: string; // active, completed, withdrawn, cancelled

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  withdrawnAt!: Date | null;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  updatedAt!: Date;

  // Associations
  @BelongsTo(() => UserModel)
  user!: UserModel;

  @HasMany(() => SavingsContributionModel)
  contributions!: SavingsContributionModel[];

  // NOTE: The original Go struct had `Transactions []Transaction gorm:"foreignKey:ID"`
  // That seems incorrect (foreign key would be Transaction.ID). 
  // Assuming the intended foreign key is `savings_goal_id` on Transaction.
  // We'll define a HasMany with foreignKey: 'savingsGoalId' – adjust if different.
  @HasMany(() => TransactionModel, 'savingsGoalId')
  transactions!: TransactionModel[];

  // Hooks
  @BeforeCreate
  static setTargetDate(instance: SavingsGoalModel):void {
    if (!instance.id) {
      instance.id = uuidv4();
    }
    // Calculate target date based on start date and duration days
    if (instance.startDate && instance.durationDays > 0) {
      const start = new Date(instance.startDate);
      instance.targetDate = new Date(start.getTime() + instance.durationDays * 24 * 60 * 60 * 1000);
    }
  }

  @AfterUpdate
  static async checkCompletion(instance: SavingsGoalModel): Promise<void> {
    if (instance.currentAmount >= instance.targetAmount && instance.status === 'active') {
      instance.status = 'completed';
      await instance.save();
    }
  }
}