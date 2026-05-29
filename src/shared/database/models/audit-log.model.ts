import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  Index,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import AdminUserModel from '@/shared/database/models/admin-users.model';
import UserModel from '@/shared/database/models/user.model';

@Table({
  tableName: 'audit_logs',
  timestamps: false,
  underscored: true,
  modelName: 'AuditLog',
})
export default class AuditLogModel extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Index
  @ForeignKey(() => AdminUserModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  adminId!: string | null;

  @Index
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  userId!: string | null;

  @Index
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  action!: string; // e.g., "USER_CREATED", "WALLET_LOCKED"

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  entityType!: string; // user, wallet, transaction, provider

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  entityId!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  oldValue!: object | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  newValue!: object | null;

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
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata!: object | null;

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  createdAt!: Date;

  // Associations
  @BelongsTo(() => AdminUserModel)
  admin!: AdminUserModel | null;

  @BelongsTo(() => UserModel)
  user!: UserModel | null;
}