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

@Table({
  tableName: 'two_fas',
  timestamps: true,
  underscored: true,
  modelName: 'TwoFA',
})
export default class TwoFAModel extends Model {
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

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  secret!: string;

  @Column({
    type: DataType.TEXT, // stores JSON array of hashed backup codes
    allowNull: true,
  })
  backupCodes!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  })
  isEnabled!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  verifiedAt!: Date | null;

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

  @BelongsTo(() => UserModel)
  user!: UserModel;
}