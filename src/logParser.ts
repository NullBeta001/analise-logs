import * as fs from "fs";
import * as readline from "readline";
import mongoose from "mongoose";
require("dotenv").config();

const logFilePath = "logs/AccessLogs (1).log";
const suaUriDeConexao =
  "mongodb+srv://nullbeta:JVkB8pQm1tOKdbni@cluster0.u7mz3qp.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(suaUriDeConexao);
mongoose.connection.once("open", () => {
  console.log("Conectado ao MongoDB!");
  processLog();
});

const LogSchema = new mongoose.Schema({
  ipAddress: String,
  timestamp: Date,
  version: String,
  id: String,
  description: String,
});

const Log = mongoose.model("Log", LogSchema);

export const processLog = () => {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  rl.on("line", async (line) => {
    const logData = parseLogLine(line);
    await saveToDatabase(logData);
  });

  // rl.on("close", () => {
  //   mongoose.disconnect();
  //   console.log("Mongo DB desconectado");
  // });
};

const parseLogLine = (line: string) => {
  const [ipAddress, timestamp, version, id, description] = line.split(";");
  return {
    ipAddress,
    timestamp: new Date(timestamp),
    version,
    id,
    description,
  };
};

const saveToDatabase = async (logData: any) => {
  try {
    const logEntry = new Log(logData);
    await logEntry.save();
    console.log("Registro inserido:", logEntry);
  } catch (error) {
    console.error("Erro ao salvar no MongoDB:", `${error}`);
  }
};
