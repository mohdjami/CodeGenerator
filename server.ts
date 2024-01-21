import app from "./app";

const port: string | undefined = process.env.PORT;
const Db: string | undefined = process.env.DATABASE_URL;

app.listen(8000, () => console.log(`server running on port ${port}`));
