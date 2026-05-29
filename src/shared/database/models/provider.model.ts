import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Unique,
  Index,
  HasMany,
} from 'sequelize-typescript';
import BillDetailModel from '@/shared/database/models/bill-detail.model';
import ProviderLogModel from '@/shared/database/models/provider-log.model';

@Table({
  tableName: 'providers',
  timestamps: false,         // manual createdAt/updatedAt
  underscored: true,
  modelName: 'Provider',
})
export default class ProviderModel extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Unique
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  code!: string;

  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  type!: string;              // airtime, data, electricity, betting, bank

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  category!: string;          // mtn, glo, ikeja_electric, etc.

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  isActive!: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 100,
    allowNull: true,
  })
  priority!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  baseUrl!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  apiKey!: string;            // encrypted

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  apiSecret!: string;         // encrypted

  @Column({
    type: DataType.INTEGER,
    defaultValue: 30,
    allowNull: true,
  })
  timeoutSeconds!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 2,
    allowNull: true,
  })
  retryCount!: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    defaultValue: 0,
    allowNull: true,
  })
  marginPercent!: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata!: object | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastHealthCheck!: Date | null;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'unknown',
    allowNull: true,
  })
  healthStatus!: string;      // healthy, degraded, down

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
  @HasMany(() => BillDetailModel)
  billDetails!: BillDetailModel[];

  @HasMany(() => ProviderLogModel)
  providerLogs!: ProviderLogModel[];
}