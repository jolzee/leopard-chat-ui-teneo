import { doesParameterExist } from "@/utils/utils";
import logger from "consola";
logger.level = process.env.NODE_ENV === "production" && !doesParameterExist("leopardDebug") ? 0 : 5;

export const getLogger = tagName => logger.withTag(tagName);
