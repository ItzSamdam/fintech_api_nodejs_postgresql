import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Unique,
} from 'sequelize-typescript';

@Table({
  tableName: 'tier_limits',
  timestamps: false,
  underscored: true,
  modelName: 'TierLimit',
})
export default class TierLimit extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Unique
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  tier!: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  dailyLimit!: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  weeklyLimit!: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  monthlyLimit!: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  singleTxLimit!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: true,
  })
  canSendMoney!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: true,
  })
  canBuyAirtime!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: true,
  })
  canBuyData!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: true,
  })
  canPayElectricity!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: true,
  })
  canFundBetting!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: true,
  })
  canSave!: boolean;

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
}