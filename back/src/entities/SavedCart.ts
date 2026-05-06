import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/** Carrito persistente por usuario de la app (UUID clientUserId), sincronizado entre dispositivos. */
@Entity({ name: "saved_carts" })
export class SavedCart {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 64, unique: true })
  clientUserId: string;

  @Column({ type: "jsonb" })
  items: unknown[];

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
