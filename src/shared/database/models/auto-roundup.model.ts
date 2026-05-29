import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Unique,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import UserModel from '@/shared/database/models/user.model';
import SavingsGoalModel from '@/shared/database/models/saving-goal.model';

@Table({
  tableName: 'auto_roundups',
  timestamps: false,
  underscored: true,
  modelName: 'AutoRoundup',
})
export default class AutoRoundupModel extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Unique
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @ForeignKey(() => SavingsGoalModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  savingsGoalId!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: true,
  })
  isActive!: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
    allowNull: true,
  })
  multiplier!: number;

  @Column({
    type: DataType.BIGINT,
    defaultValue: 1000,
    allowNull: true,
  })
  maxDailyAmount!: number; // in kobo

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: true,
  })
  totalRoundup!: number;

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

  @BelongsTo(() => SavingsGoalModel)
  savingsGoal!: SavingsGoalModel;
}