import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  Unique,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Transaction from '@/shared/database/models/transaction.model';

@Table({
  tableName: 'transfer_details',
  timestamps: false,         // only createdAt
  underscored: true,
  modelName: 'TransferDetail',
})
export default class TransferDetail extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Unique
  @ForeignKey(() => Transaction)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  transactionId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  recipientType!: string;    // bank, wallet

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  recipientId!: string;      // account number or wallet ID

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  recipientName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  recipientBankCode!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  recipientBankName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  nipSessionId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  narration!: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  createdAt!: Date;

  // Association
  @BelongsTo(() => Transaction)
  transaction!: Transaction;
}