import { Sequelize } from "sequelize";

export async function connectDB() {
  const sequelize = new Sequelize("express", "root", "", {
    host: "localhost",
    dialect: "mysql",
    logging: false,
  });

  await sequelize.authenticate();
  return sequelize;
}

export async function closeDB(sequelize: Sequelize) {
  await sequelize.close();
}

export async function initDB() {
  const sequelize = await connectDB();

  await sequelize.query(`CREATE TABLE IF NOT EXISTS blogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT NOW(),
    updatedAt DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW()
  )`);

  await closeDB(sequelize);
}

