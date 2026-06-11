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
import SupportTicket from '@/shared/database/models/support-ticket.model';

@Table({
  tableName: 'ticket_messages',
  timestamps: false,
  underscored: true,
  modelName: 'TicketMessage',
})
export default class TicketMessage extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Index
  @ForeignKey(() => SupportTicket)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  ticketId!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  senderType!: string; // user, admin

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  senderId!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  attachmentUrl!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  })
  isRead!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  readAt!: Date | null;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  createdAt!: Date;

  // Association
  @BelongsTo(() => SupportTicket)
  ticket!: SupportTicket;
}