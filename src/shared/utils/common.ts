import dayjs from "dayjs";
import { type PaginatedResult, type PaginationOptions } from "@/shared/types/global";

/** Check if token is still valid compared to last DB update */
export const isSessionValid = (lastDbUpdate: Date, payloadTime: Date): boolean => {
  const tokenTime = dayjs(payloadTime);
  return !lastDbUpdate || !tokenTime.isBefore(dayjs(lastDbUpdate));
};


export function paginatedData<T>(
  rows: T[],
  count: number,
  options: PaginationOptions
): PaginatedResult<T> {
  const page = Number(options.page) || 1;
  const pageSize = Number(options.pageSize) || 10;
  const totalPages = Math.ceil(count / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  return {
    docs: rows,
    totalDocs: count,
    totalPages,
    currentPage,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
    lastPage: totalPages,
  };
}

/** Range filter for queries */
export const rangeFilter = (key: string, greaterThan?: any, lesserThan?: any): any => {
  if (greaterThan === undefined && lesserThan === undefined) return;
  const filter: any = {};
  if (greaterThan !== undefined) filter.$gte = greaterThan;
  if (lesserThan !== undefined) filter.$lte = lesserThan;
  return { [key]: filter };
};

/** Date validator */
export const isValidDate = (date: string): boolean => !isNaN(Date.parse(date));

/** Generate numeric OTP with expiration */
export const otpGenerator = (length: number, minutes: number): { code: string; expireAt: Date } => {
  const chars = "0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return { code, expireAt: new Date(Date.now() + minutes * 60 * 1000) };
};


/** UUID helpers */
export const stringToUUID = (str: string): string => {
  if (str.length !== 32) throw new Error("Input string must be exactly 32 characters long");
  return `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(20)}`;
};

export const uuidToString = (uuid: string): string => {
  const pattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!pattern.test(uuid)) throw new Error("Input must be a valid UUID string");
  return uuid.replace(/-/g, "");
};