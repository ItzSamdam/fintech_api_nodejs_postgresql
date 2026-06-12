import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  // Index,
} from 'sequelize-typescript';

@Table({
  tableName: 'otps',
  timestamps: false,         // only createdAt
  underscored: true,
  modelName: 'OTP',
  indexes: [
    {
      name: 'otps_phone_number_idx',
      fields: ['phone_number']  // Use database column name here
    }
  ]
})
export default class OTP extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phoneNumber!: string;

  @Column({
    type: DataType.STRING(6),
    allowNull: false,
  })
  code!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  purpose!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  })
  isUsed!: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: true,
  })
  attempts!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt!: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  createdAt!: Date;
}