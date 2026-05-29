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
  tableName: 'fee_configs',
  timestamps: false,         // manual createdAt/updatedAt
  underscored: true,
  modelName: 'FeeConfig',
})
export default class FeeConfigModel extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Unique
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  billType!: string;          // transfer, airtime, data, electricity, betting

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  feeType!: string;           // percentage, fixed

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  feeValue!: number;          // stored as decimal, returned as string; cast if needed

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: true,
  })
  capAmount!: number;         // maximum fee in kobo (0 = no cap)

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: true,
  })
  minAmount!: number;         // minimum transaction amount in kobo

  @Column({
    type: DataType.BIGINT,
    defaultValue: 0,
    allowNull: true,
  })
  maxAmount!: number;         // maximum transaction amount in kobo

  @Column({
    type: DataType.DECIMAL(5, 2),
    defaultValue: 7.5,
    allowNull: true,
  })
  vatRate!: number;           // VAT percentage

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: true,
  })
  isActive!: boolean;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  effectiveFrom!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  effectiveTo!: Date | null;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  createdBy!: string | null;

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