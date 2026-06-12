import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  // Index,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Provider from '@/shared/database/models/provider.model';

@Table({
  tableName: 'provider_logs',
  timestamps: false,         // only createdAt
  underscored: true,
  modelName: 'ProviderLog',
  indexes: [
    {
      name: 'provider_logs_provider_id_idx',
      fields: ['provider_id']  // Use database column name here
    },
    {
      name: 'provider_logs_transaction_id_idx',
      fields: ['transaction_id']  // Use database column name here
    }
  ]
})
export default class ProviderLog extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  
  @ForeignKey(() => Provider)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  providerId!: string;

  
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  transactionId!: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  endpoint!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  request!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  response!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  statusCode!: number | null;

  @Column({
    type: DataType.INTEGER,   // milliseconds
    allowNull: true,
  })
  responseTime!: number | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  })
  isError!: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  errorMessage!: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  createdAt!: Date;

  // Association
  @BelongsTo(() => Provider)
  provider!: Provider;

}