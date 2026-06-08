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
import User from '@/shared/database/models/user.model';

@Table({
  tableName: 'trusted_devices',
  timestamps: false,         // only createdAt, no updatedAt
  underscored: true,
  modelName: 'TrustedDevice',
})
export default class TrustedDevice extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Index
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  // Composite unique constraint on (userId, deviceId)
  @Unique('unique_user_device')
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  deviceId!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  deviceName!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  deviceType!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: true,
  })
  isTrusted!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastUsedAt!: Date | null;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  createdAt!: Date;

  @BelongsTo(() => User)
  user!: User;
}