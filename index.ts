import type { NextFunction, Request, Response } from "express";
import express from "express";
import cors from "cors";
import { QueryTypes } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { initDB, connectDB, closeDB } from "./model/index.js";
import { z } from "zod";

const app = express();
app.set("json escape", true);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const reqBodySchema = z
  .object({
    title: z.string().trim().max(255),
    description: z.string().trim().max(2000),
  })
  .strict();

app.get("/blogs", async (_req, res) => {
  const sequelize = await connectDB();
  try {
    const blogs = await sequelize.query("SELECT * FROM blogs", {
      type: QueryTypes.SELECT,
    });
    res
      .status(blogs.length > 0 ? StatusCodes.OK : StatusCodes.NO_CONTENT)
      .json({
        success: true,
        blogs,
      });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: (error as Error).message,
    });
  } finally {
    await closeDB(sequelize);
  }
});

app.post("/blog", async (req, res) => {
  const sequelize = await connectDB();
  try {
    reqBodySchema.parse(req.body);

    const { title, description } = req.body;

    await sequelize.query(
      `INSERT INTO blogs (title, description) VALUES (:title, :description)`,
      {
        type: QueryTypes.INSERT,
        replacements: { title, description },
      }
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: (error as Error).message,
    });
  } finally {
    await closeDB(sequelize);
  }
});

app.put("/blog/:id", async (req, res) => {
  const sequelize = await connectDB();
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) throw new Error("Id must be an integer");

    reqBodySchema.parse(req.body);
    const { title, description } = req.body;

    await sequelize.query(
      `UPDATE blogs SET title=:title, description=:description WHERE id=:id`,
      {
        type: QueryTypes.UPDATE,
        replacements: { title, description, id },
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: (error as Error).message,
    });
  } finally {
    await closeDB(sequelize);
  }
});

app.delete("/blog/:id", async (req, res) => {
  const sequelize = await connectDB();
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) throw new Error("Id must be an integer");

    await sequelize.query(`DELETE FROM blogs WHERE id=:id`, {
      type: QueryTypes.DELETE,
      replacements: { id },
    });

    res.status(StatusCodes.OK).json({
      success: true,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: (error as Error).message,
    });
  } finally {
    await closeDB(sequelize);
  }
});

app.use((error: Error, _req: Request, _res: Response, next: NextFunction) => {
  next(error);
});

app.listen(3000, async () => {
  await initDB();
  console.log("Starting");
});
