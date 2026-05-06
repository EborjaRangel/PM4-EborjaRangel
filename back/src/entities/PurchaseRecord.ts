import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

/** Historial de compras del front: identificado por el id de usuario en la app (UUID). */
@Entity({ name: "purchase_records" })
export class PurchaseRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 64 })
  clientUserId: string;

  @Column({ type: "varchar", length: 255 })
  userEmail: string;

  @Column({ type: "jsonb" })
  items: unknown[];

  @Column({ type: "jsonb" })
  totals: Record<string, unknown>;

  /** Dirección y teléfono al momento de la compra; lat/lng opcional para mapa. */
  @Column({ type: "jsonb", nullable: true })
  shipping:
    | {
        address: string;
        phone: string;
        lat?: number;
        lng?: number;
      }
    | null;

  @Column({ type: "varchar", length: 64, default: "completada_simulada" })
  status: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
