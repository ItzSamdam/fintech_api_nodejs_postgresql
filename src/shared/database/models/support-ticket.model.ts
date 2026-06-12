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
import User from '@/shared/database/models/user.model';
import AdminUser from '@/shared/database/models/admin-users.model'; // adjust path as needed
import TicketMessage from '@/shared/database/models/ticket-message.model';

@Table({
  tableName: 'support_tickets',
  timestamps: false,
  underscored: true,
  modelName: 'SupportTicket',
  indexes: [
    {
      name: 'support_tickets_user_id_idx',
      fields: ['user_id']  // Use database column name here
    },
    {
      name: 'support_tickets_transaction_id_idx',
      fields: ['transaction_id']
    }
  ]
})
export default class SupportTicket extends Model {
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

  @ForeignKey(() => AdminUser)
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
  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => AdminUser, { foreignKey: 'assignedTo' })
  assignedAdmin!: AdminUser | null;

  @HasMany(() => TicketMessage)
  messages!: TicketMessage[];
}