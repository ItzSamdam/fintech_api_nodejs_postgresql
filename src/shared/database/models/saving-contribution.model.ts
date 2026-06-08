import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  Index,
  Unique,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import SavingsGoal from '@/shared/database/models/saving-goal.model';
import Transaction from '@/shared/database/models/transaction.model';

@Table({
  tableName: 'savings_contributions',
  timestamps: false,
  underscored: true,
  modelName: 'SavingsContribution',
})
export default class SavingsContribution extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Index
  @ForeignKey(() => SavingsGoal)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  savingsGoalId!: string;

  @Unique
  @ForeignKey(() => Transaction)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  transactionId!: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  amount!: number; // in kobo

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: true,
  })
  interestEarned!: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  contributionDate!: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  })
  isAutoDebit!: boolean;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  createdAt!: Date;

  // Associations
  @BelongsTo(() => SavingsGoal)
  savingsGoal!: SavingsGoal;

  @BelongsTo(() => Transaction)
  transaction!: Transaction;
}