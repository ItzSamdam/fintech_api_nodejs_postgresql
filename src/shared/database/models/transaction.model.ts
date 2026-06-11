import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Unique,
  Index,
  ForeignKey,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';
import User from '@/shared/database/models/user.model';
import Wallet from '@/shared/database/models/wallet.model';
import TransferDetail from '@/shared/database/models/transfer-detail.model';
import BillDetail from './bill-detail.model';

@Table({
  tableName: 'transactions',
  timestamps: false,
  underscored: true,
  modelName: 'Transaction',
})
export default class Transaction extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Unique
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  reference!: string;

  @Index
  @ForeignKey(() => Wallet)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  walletId!: string;

  @Index
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  type!: string;              // credit, debit

  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  category!: string;          // transfer, airtime, data, etc.

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  subCategory!: string;       // mtn, glo, ikeja_electric, bet9ja

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: true,
  })
  fee!: number;

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: true,
  })
  vat!: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  totalAmount!: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  balanceBefore!: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  balanceAfter!: number;

  @Index
  @Column({
    type: DataType.STRING(20),
    defaultValue: 'pending',
    allowNull: true,
  })
  status!: string;            // pending, success, failed, reversed

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  description!: string;

  @Column({
    type: DataType.JSONB,     // PostgreSQL JSONB
    allowNull: true,
  })
  metadata!: object | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  providerReference!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  providerResponse!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: true,
  })
  retryCount!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  })
  isReversed!: boolean;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  reversedTxnId!: string | null;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
  })
  ipAddress!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  deviceId!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  completedAt!: Date | null;

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
  @BelongsTo(() => Wallet)
  wallet!: Wallet;

  @BelongsTo(() => User)
  user!: User;

  @HasOne(() => TransferDetail, 'transactionId')
  transferDetail!: TransferDetail | null;

  @HasOne(() => BillDetail, 'transactionId')
  billDetail!: BillDetail | null;
}