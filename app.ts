import express, { Request, Response } from "express";
import { db } from "./db";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(`${__dirname}/public`));

const createRandomCode = (): string => {
  const characters: string =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code: string = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex: number = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
};

const createCodeDb = async (code: string) => {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + 60);

  const codeDb = await db.code.create({
    data: {
      code: code,
      expiresAt: expiresAt,
    },
  });
  return codeDb;
};

app.get("/code", async (req: Request, res: Response): Promise<Response> => {
  try {
    const code: string = createRandomCode();
    const codeDb = await createCodeDb(code);

    return res.status(201).json({
      message: "Success",
      Code: codeDb,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
});
app.post(
  "/code/uses",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const codeExists = await db.code.findUnique({
        where: {
          code: req.body.code,
        },
        select: { expiresAt: true },
      });

      if (!codeExists) {
        return res.status(404).json({
          error: "Code does not exist or it is Invalid",
        });
      }
      if (codeExists.expiresAt!.getTime() > Date.now()) {
        return res.status(200).json({
          message: "Code is Correct",
          Code: codeExists,
        });
      } else {
        return res.status(410).json({
          error: "Code is expired",
          Code: codeExists,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: error,
      });
    }
  }
);

export default app;
