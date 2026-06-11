import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  Unique,
  Index,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Transaction from '@/shared/database/models/transaction.model';
import Provider from '@/shared/database/models/provider.model';

@Table({
  tableName: 'bill_details',
  timestamps: false,         // only createdAt
  underscored: true,
  modelName: 'BillDetail',
})
export default class BillDetail extends Model {
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

  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  billType!: string;          // airtime, data, electricity, betting

  @Index
  @ForeignKey(() => Provider)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  providerId!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  providerName!: string;

  @Column({
    type: DataType.STRING(15),
    allowNull: true,
  })
  phoneNumber!: string;       // For airtime/data

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  meterNumber!: string;       // For electricity

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  meterType!: string;         // prepaid, postpaid

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  customerName!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  customerAddress!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  bettingAccount!: string;    // For betting

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  bettingOperator!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  dataPlanId!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  dataPlanName!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  dataVolume!: string;        // e.g., "1GB"

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  dataValidity!: string;      // e.g., "30 days"

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  electricityToken!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: true,
  })
  electricityUnits!: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  createdAt!: Date;

  // Associations
  @BelongsTo(() => Transaction)
  transaction!: Transaction;

  @BelongsTo(() => Provider)
  provider!: Provider;

}