import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

/**
 * Dirección de envío del cliente. Un usuario puede tener varias.
 * `isDefault` se usa para marcar la dirección preferida; solo una a la vez por usuario.
 */
@Entity({ name: "addresses" })
@Index("addresses_user_id_idx", ["userId"])
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  userId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  /** Alias para identificar la dirección (Casa, Oficina, Mamá, etc.) */
  @Column({ type: "text", default: "" })
  label: string;

  @Column({ type: "text", default: "" })
  address: string;

  @Column({ type: "text", default: "" })
  phone: string;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: {
      to: (value?: number | null) => value ?? null,
      from: (value: string | null) =>
        value === null || value === undefined ? null : parseFloat(value),
    },
  })
  lat: number | null;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: {
      to: (value?: number | null) => value ?? null,
      from: (value: string | null) =>
        value === null || value === undefined ? null : parseFloat(value),
    },
  })
  lng: number | null;

  @Column({ type: "boolean", default: false })
  isDefault: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
