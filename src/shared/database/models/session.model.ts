import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  // Index,
  Unique,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from '@/shared/database/models/user.model';

@Table({
  tableName: 'sessions',
  timestamps: false,         // manual createdAt, no updatedAt
  underscored: true,
  modelName: 'Session',
  indexes: [
    {
      name: 'sessions_user_id_idx',
      fields: ['user_id']  // Use database column name here
    }
  ]
})
export default class Session extends Model {
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
  })
  userId!: string;

  @Unique
  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  token!: string;

  @Unique
  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  refreshToken!: string;

  @Column({
    type: DataType.STRING(45),
    allowNull: false,
  })
  ipAddress!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  userAgent!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  deviceName!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  isActive!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt!: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  lastActiveAt!: Date;

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
