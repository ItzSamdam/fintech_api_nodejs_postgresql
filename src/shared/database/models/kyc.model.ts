import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Unique,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import User from '@/shared/database/models/user.model'; // adjust import path as needed

@Table({
  tableName: 'kycs',
  timestamps: true,
  underscored: true,      // maps camelCase to snake_case columns
  paranoid: false,        // no soft delete (deletedAt not needed)
  modelName: 'KYC',
})
export default class KYC extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Unique // uniqueIndex: idx_kyc_user
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  bvnVerified!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  bvnVerifiedAt!: Date | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  ninVerified!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  ninVerifiedAt!: Date | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  faceVerified!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  faceVerifiedAt!: Date | null;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: true,
  })
  livenessScore!: number | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  idCard!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  passportPhoto!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  utilityBill!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'pending',
    allowNull: true,
  })
  status!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  rejectionReason!: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  approvedBy!: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approvedAt!: Date | null;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  updatedAt!: Date;

  // Relationship: belongs to User
  @BelongsTo(() => User)
  user!: User;
}