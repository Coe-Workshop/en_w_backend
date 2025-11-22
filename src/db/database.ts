import { Pool } from "pg";

const pool: Pool = new Pool({
  host: "localhost",
  user: "postgres",
  database: "practice",
  password: "your-password",
  port: 5432,
});

export { pool };
