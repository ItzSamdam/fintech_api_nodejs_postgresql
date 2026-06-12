import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  Unique,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,      // maps camelCase properties to snake_case columns
  paranoid: true,         // enables soft delete (uses deletedAt)
  modelName: 'User',
  indexes: [
    {
      name: 'users_device_id_idx',
      fields: ['device_id']  // Use database column name here
    },
    {
      name: 'users_push_device_id_idx',
      fields: ['push_device_id']  // Use database column name here
    }
  ]
})
export default class User extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phoneNumber!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  middleName!: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  dateOfBirth!: Date; // DATEONLY maps to JavaScript Date (time part ignored)

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  gender!: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email!: string;

  @Index
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  bvn!: string; // stored as encrypted value in practice

  @Index
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  nin!: string; // stored as encrypted value in practice

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  tier!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  isActive!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  isSuspended!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  suspendedAt!: Date | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  suspensionReason!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  passwordHash!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    // field: "device_id"
  })
  deviceId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  pushDeviceId!: string; // for push notifications

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLoginAt!: Date | null;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
  })
  lastLoginIp!: string;

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

  @DeletedAt
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deletedAt!: Date | null;
}



  // @Column({
  //   type: DataType.STRING,
  //   allowNull: true,
  // })
  // facePhotoUrl!: string;

  // @Column({
  //   type: DataType.TEXT,
  //   allowNull: true,
  // })
  // faceEmbedding!: string;