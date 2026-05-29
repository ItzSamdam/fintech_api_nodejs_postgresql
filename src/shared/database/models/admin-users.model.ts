import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Unique,
  HasMany,
} from 'sequelize-typescript';
import AuditLogModel from '@/shared/database/models/audit-log.model';

@Table({
  tableName: 'admin_users',
  timestamps: false,
  underscored: true,
  modelName: 'AdminUser',
})
export default class AdminUserModel extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  passwordHash!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  fullName!: string;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'viewer',
    allowNull: false,
  })
  role!: string; // super_admin, admin, viewer, support

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: true,
  })
  isActive!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLoginAt!: Date | null;

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

  // Relationships
  @HasMany(() => AuditLogModel)
  auditLogs!: AuditLogModel[];
}