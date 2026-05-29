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
import UserModel from '@/shared/database/models/user.model';

@Table({
  tableName: 'sessions',
  timestamps: false,         // manual createdAt, no updatedAt
  underscored: true,
  modelName: 'Session',
})
export default class SessionModel extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Index
  @ForeignKey(() => UserModel)
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

  @BelongsTo(() => UserModel)
  user!: UserModel;
}
