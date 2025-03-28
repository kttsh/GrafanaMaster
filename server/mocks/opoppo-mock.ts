import { OPoppoUser } from "../opoppo";

/**
 * Opoppo APIのモックユーザーデータ
 */
export const mockOPoppoUsers: OPoppoUser[] = [
  {
    USER_ID: "0001",
    SEI: "山田",
    MEI: "太郎",
    YAKUSYOKU_CD: "01",
    KAISYA_CD: "001",
    SOSHIKI_CD: "0001",
    YAKUSYOKU_NM: "部長",
    SOSHIKI_NM: "営業部",
    KAISYA_NM: "本社",
  },
  {
    USER_ID: "0002",
    SEI: "佐藤",
    MEI: "花子",
    YAKUSYOKU_CD: "02",
    KAISYA_CD: "001",
    SOSHIKI_CD: "0001",
    YAKUSYOKU_NM: "課長",
    SOSHIKI_NM: "営業部",
    KAISYA_NM: "本社",
  },
  {
    USER_ID: "0003",
    SEI: "鈴木",
    MEI: "一郎",
    YAKUSYOKU_CD: "03",
    KAISYA_CD: "001",
    SOSHIKI_CD: "0002",
    YAKUSYOKU_NM: "社員",
    SOSHIKI_NM: "技術部",
    KAISYA_NM: "本社",
  },
  {
    USER_ID: "0004",
    SEI: "田中",
    MEI: "浩",
    YAKUSYOKU_CD: "01",
    KAISYA_CD: "001",
    SOSHIKI_CD: "0002",
    YAKUSYOKU_NM: "部長",
    SOSHIKI_NM: "技術部",
    KAISYA_NM: "本社",
  },
  {
    USER_ID: "0005",
    SEI: "高橋",
    MEI: "明",
    YAKUSYOKU_CD: "03",
    KAISYA_CD: "002",
    SOSHIKI_CD: "0003",
    YAKUSYOKU_NM: "社員",
    SOSHIKI_NM: "管理部",
    KAISYA_NM: "支社",
  },
];

/**
 * Opoppo APIのモック会社データ
 */
export const mockOPoppoCompanies = [
  { KAISYA_CD: "001", KAISYA_NM: "本社" },
  { KAISYA_CD: "002", KAISYA_NM: "支社" },
  { KAISYA_CD: "003", KAISYA_NM: "子会社" },
];

/**
 * Opoppo APIのモック組織データ
 */
export const mockOPoppoOrganizations = [
  { KAISYA_CD: "001", SOSHIKI_CD: "0001", SOSHIKI_NM: "営業部" },
  { KAISYA_CD: "001", SOSHIKI_CD: "0002", SOSHIKI_NM: "技術部" },
  { KAISYA_CD: "002", SOSHIKI_CD: "0003", SOSHIKI_NM: "管理部" },
  { KAISYA_CD: "003", SOSHIKI_CD: "0004", SOSHIKI_NM: "企画部" },
];

/**
 * Opoppo APIのモック役職データ
 */
export const mockOPoppoPositions = [
  { KAISYA_CD: "001", YAKUSYOKU_CD: "01", YAKUSYOKU_NM: "部長" },
  { KAISYA_CD: "001", YAKUSYOKU_CD: "02", YAKUSYOKU_NM: "課長" },
  { KAISYA_CD: "001", YAKUSYOKU_CD: "03", YAKUSYOKU_NM: "社員" },
  { KAISYA_CD: "002", YAKUSYOKU_CD: "01", YAKUSYOKU_NM: "部長" },
  { KAISYA_CD: "002", YAKUSYOKU_CD: "03", YAKUSYOKU_NM: "社員" },
];