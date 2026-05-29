import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Index,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import UserModel from '@/shared/database/models/user.model';
import AdminUserModel from '@/shared/database/models/admin-users.model'; // adjust path as needed
import TicketMessageModel from '@/shared/database/models/ticket-message.model';

@Table({
  tableName: 'support_tickets',
  timestamps: false,
  underscored: true,
  modelName: 'SupportTicket',
})
export default class SupportTicketModel extends Model {
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

  @Index
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  transactionId!: string | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  category!: string; // transaction, account, billing, technical, other

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'medium',
    allowNull: true,
  })
  priority!: string; // low, medium, high, urgent

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  subject!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Index
  @Column({
    type: DataType.STRING(20),
    defaultValue: 'open',
    allowNull: true,
  })
  status!: string; // open, in_progress, resolved, closed

  @ForeignKey(() => AdminUserModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  assignedTo!: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  resolvedAt!: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  closedAt!: Date | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  rating!: number | null; // 1-5

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  feedback!: string;

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
  @BelongsTo(() => UserModel)
  user!: UserModel;

  @BelongsTo(() => AdminUserModel, { foreignKey: 'assignedTo' })
  assignedAdmin!: AdminUserModel | null;

  @HasMany(() => TicketMessageModel)
  messages!: TicketMessageModel[];
}