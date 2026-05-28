import {
  Model,
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';

@Table({
    tableName: "examples",
    timestamps: true,
    underscored: true,
    modelName: 'Example',
})
export default class ExampleModel extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
        allowNull: false,
        field: '_id',
    })
    public id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'name',
    })
    public name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'description',
    })
    public description!: string;


    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'createdAt', // This maps to the created_at column in the database
    })
    public createdAt!: Date;

    @UpdatedAt
    @Column({
        type: DataType.DATE,
        field: 'updatedAt', // This maps to the created_at column in the database
    })
    public updatedAt!: Date;
}
