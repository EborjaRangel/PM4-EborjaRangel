import { HOST, PORT } from "./config/envs";
import app from "./server";
import "reflect-metadata"
import { AppDataSource } from "./config/dataSource";
import { preLoadCategories } from "./helpers/preLoadCategories";
import { preLoadProducts } from "./helpers/preLoadProducts";
import { preLoadAdminUser } from "./helpers/preLoadAdminUser";

const initialize = async () => {
    console.log("Initializing server");
    await AppDataSource.initialize();
    console.log("Database initialized");
    await preLoadCategories();
    await preLoadProducts();
    await preLoadAdminUser();
    app.listen(PORT, HOST, () => {
        console.log(`Server running on http://${HOST}:${PORT}`);
    });
}

initialize().catch((err) => {
    console.error("[FATAL] No se pudo conectar a PostgreSQL:", err?.message ?? err);
    console.error(
        "Revisa DATABASE_URL o DB_HOST/DB_USER/DB_PASSWORD/DB_NAME en .env (y DB_SSL si tu proveedor exige TLS)."
    );
    process.exit(1);
});

