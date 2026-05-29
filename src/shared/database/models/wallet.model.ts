import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Unique,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import UserModel from '@/shared/database/models/user.model';
import TransactionModel from '@/shared/database/models/transaction.model';

@Table({
  tableName: 'wallets',
  timestamps: false,         // manual createdAt/updatedAt
  underscored: true,
  modelName: 'Wallet',
})
export default class WalletModel extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Unique
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @Column({
    type: DataType.BIGINT,   // Amount in kobo
    defaultValue: 0,
    allowNull: false,
  })
  balance!: number;          // stored as bigint, returned as number

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: false,
  })
  ledgerBalance!: number;

  @Column({
    type: DataType.STRING(3),
    defaultValue: 'NGN',
    allowNull: true,
  })
  currency!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  })
  isLocked!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lockedAt!: Date | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  lockReason!: string;

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: false,
  })
  dailySpent!: number;

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: false,
  })
  weeklySpent!: number;

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: false,
  })
  monthlySpent!: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  lastDailyReset!: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  lastWeeklyReset!: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  lastMonthlyReset!: Date;

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

  @HasMany(() => TransactionModel)
  transactions!: TransactionModel[];
}