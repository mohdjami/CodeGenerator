"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.static(`${__dirname}/public`));
const createRandomCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
};
const createCodeDb = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 60);
    const codeDb = yield db_1.db.code.create({
        data: {
            code: code,
            expiresAt: expiresAt,
        },
    });
    return codeDb;
});
app.get("/code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const code = createRandomCode();
        const codeDb = yield createCodeDb(code);
        return res.status(201).json({
            message: "Success",
            Code: codeDb,
        });
    }
    catch (error) {
        return res.status(500).json({
            error,
        });
    }
}));
app.post("/code/uses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const codeExists = yield db_1.db.code.findUnique({
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
        if (codeExists.expiresAt.getTime() > Date.now()) {
            return res.status(200).json({
                message: "Code is Correct",
                Code: codeExists,
            });
        }
        else {
            return res.status(410).json({
                error: "Code is expired",
                Code: codeExists,
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error,
        });
    }
}));
exports.default = app;
