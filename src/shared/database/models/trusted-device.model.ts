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
import User from '@/shared/database/models/user.model';

@Table({
  tableName: 'trusted_devices',
  timestamps: false,         // only createdAt, no updatedAt
  underscored: true,
  modelName: 'TrustedDevice',
  indexes: [
    {
      name: 'trusted_devices_user_id_idx',
      fields: ['user_id']  // Use database column name here
    }
  ]
})
export default class TrustedDevice extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id'  // Sequelize-generated name is 'userId', we need 'user_id'
  })
  userId!: string;

  // Composite unique constraint on (userId, deviceId)
  @Unique('unique_user_device')
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  deviceId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  deviceName!: string;

  @Column({
    type: DataType.STRING,
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