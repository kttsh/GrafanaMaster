import pkg from 'pg';
const { Pool } = pkg;
import { storage } from './storage';
import { prisma } from './db';
import { InsertGrafanaUser } from '@shared/schema';
import { isDevelopmentMode, logMessage } from './utils';
import { 
  mockOPoppoUsers, 
  mockOPoppoCompanies, 
  mockOPoppoOrganizations, 
  mockOPoppoPositions 
} from './mocks/opoppo-mock';

// Connect to Opoppo database (only in production mode)
let opoppoDb: pkg.Pool | null = null;

if (!isDevelopmentMode()) {
  opoppoDb = new Pool({
    host: process.env.OPOPPO_DB_HOST || 'muska01',
    database: process.env.OPOPPO_DB_NAME || 'OPO_C',
    user: process.env.OPOPPO_DB_USER,
    password: process.env.OPOPPO_DB_PASSWORD,
    port: parseInt(process.env.OPOPPO_DB_PORT || '5432'),
    ssl: process.env.OPOPPO_DB_SSL === 'true'
  });
  logMessage('Initialized Opoppo DB connection for production mode');
} else {
  logMessage('Using mock data for Opoppo in development mode', 'info');
}

// Interface for Opoppo user data
export interface OPoppoUser {
  USER_ID: string;
  SEI: string;
  MEI: string;
  YAKUSYOKU_CD: string;
  KAISYA_CD: string;
  SOSHIKI_CD: string;
  YAKUSYOKU_NM?: string;
  SOSHIKI_NM?: string;
  KAISYA_NM?: string;
}

export async function getOPoppoUsers(): Promise<OPoppoUser[]> {
  // 開発モードの場合はモックデータを返す
  if (isDevelopmentMode()) {
    logMessage('Returning mock Opoppo users');
    return mockOPoppoUsers;
  }
  
  try {
    const query = `
      SELECT 
        u.USER_ID, 
        u.SEI, 
        u.MEI, 
        u.YAKUSYOKU_CD, 
        u.KAISYA_CD, 
        u.SOSHIKI_CD,
        y.YAKUSYOKU_NM,
        s.SOSHIKI_NM,
        k.KAISYA_NM
      FROM USER u
      LEFT JOIN YAKUSYOKU y ON u.KAISYA_CD = y.KAISYA_CD AND u.YAKUSYOKU_CD = y.YAKUSYOKU_CD
      LEFT JOIN SOSHIKI s ON u.KAISYA_CD = s.KAISYA_CD AND u.SOSHIKI_CD = s.SOSHIKI_CD
      LEFT JOIN KAISYA k ON u.KAISYA_CD = k.KAISYA_CD
    `;
    
    if (!opoppoDb) {
      throw new Error('Opoppo database connection not initialized');
    }
    
    const result = await opoppoDb.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching Opoppo users:', error);
    return [];
  }
}

export async function getOPoppoUserById(userId: string): Promise<OPoppoUser | null> {
  // 開発モードの場合はモックデータから検索
  if (isDevelopmentMode()) {
    logMessage(`Finding mock Opoppo user with ID: ${userId}`);
    const user = mockOPoppoUsers.find(u => u.USER_ID === userId);
    return user || null;
  }
  
  try {
    if (!opoppoDb) {
      throw new Error('Opoppo database connection not initialized');
    }
    
    const query = `
      SELECT 
        u.USER_ID, 
        u.SEI, 
        u.MEI, 
        u.YAKUSYOKU_CD, 
        u.KAISYA_CD, 
        u.SOSHIKI_CD,
        y.YAKUSYOKU_NM,
        s.SOSHIKI_NM,
        k.KAISYA_NM
      FROM USER u
      LEFT JOIN YAKUSYOKU y ON u.KAISYA_CD = y.KAISYA_CD AND u.YAKUSYOKU_CD = y.YAKUSYOKU_CD
      LEFT JOIN SOSHIKI s ON u.KAISYA_CD = s.KAISYA_CD AND u.SOSHIKI_CD = s.SOSHIKI_CD
      LEFT JOIN KAISYA k ON u.KAISYA_CD = k.KAISYA_CD
      WHERE u.USER_ID = $1
    `;
    
    const result = await opoppoDb.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error fetching Opoppo user ${userId}:`, error);
    return null;
  }
}

export async function getOPoppoCompanies(): Promise<{ KAISYA_CD: string, KAISYA_NM: string }[]> {
  // 開発モードの場合はモックデータを返す
  if (isDevelopmentMode()) {
    logMessage('Returning mock Opoppo companies');
    return mockOPoppoCompanies;
  }
  
  try {
    if (!opoppoDb) {
      throw new Error('Opoppo database connection not initialized');
    }
    
    const query = 'SELECT KAISYA_CD, KAISYA_NM FROM KAISYA ORDER BY KAISYA_NM';
    const result = await opoppoDb.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching Opoppo companies:', error);
    return [];
  }
}

export async function getOPoppoOrganizations(): Promise<{ KAISYA_CD: string, SOSHIKI_CD: string, SOSHIKI_NM: string }[]> {
  // 開発モードの場合はモックデータを返す
  if (isDevelopmentMode()) {
    logMessage('Returning mock Opoppo organizations');
    return mockOPoppoOrganizations;
  }
  
  try {
    if (!opoppoDb) {
      throw new Error('Opoppo database connection not initialized');
    }
    
    const query = 'SELECT KAISYA_CD, SOSHIKI_CD, SOSHIKI_NM FROM SOSHIKI ORDER BY KAISYA_CD, SOSHIKI_NM';
    const result = await opoppoDb.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching Opoppo organizations:', error);
    return [];
  }
}

export async function getOPoppoPositions(): Promise<{ KAISYA_CD: string, YAKUSYOKU_CD: string, YAKUSYOKU_NM: string }[]> {
  // 開発モードの場合はモックデータを返す
  if (isDevelopmentMode()) {
    logMessage('Returning mock Opoppo positions');
    return mockOPoppoPositions;
  }
  
  try {
    if (!opoppoDb) {
      throw new Error('Opoppo database connection not initialized');
    }
    
    const query = 'SELECT KAISYA_CD, YAKUSYOKU_CD, YAKUSYOKU_NM FROM YAKUSYOKU ORDER BY KAISYA_CD, YAKUSYOKU_NM';
    const result = await opoppoDb.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching Opoppo positions:', error);
    return [];
  }
}

/**
 * OPoppoデータをDB内部に同期する関数
 * これによりAPIを経由せず、直接DBにアクセスする形式に変更
 */
export async function syncOPoppoDB(): Promise<number> {
  try {
    // ステップ1: OPoppo会社データを同期
    const companies = await getOPoppoCompanies();
    for (const company of companies) {
      await prisma.oPoppoCompany.upsert({
        where: { kaisyaCd: company.KAISYA_CD },
        update: { kaisyaNm: company.KAISYA_NM },
        create: {
          kaisyaCd: company.KAISYA_CD,
          kaisyaNm: company.KAISYA_NM
        }
      });
    }
    
    // ステップ2: OPoppo組織データを同期
    const organizations = await getOPoppoOrganizations();
    for (const org of organizations) {
      try {
        await prisma.oPoppoOrganization.upsert({
          where: {
            soshikiCd_kaisyaCd: {
              soshikiCd: org.SOSHIKI_CD,
              kaisyaCd: org.KAISYA_CD
            }
          },
          update: { soshikiNm: org.SOSHIKI_NM },
          create: {
            soshikiCd: org.SOSHIKI_CD,
            kaisyaCd: org.KAISYA_CD,
            soshikiNm: org.SOSHIKI_NM
          }
        });
      } catch (error) {
        console.error(`Error upserting organization ${org.SOSHIKI_CD}:`, error);
      }
    }
    
    // ステップ3: OPoppo役職データを同期
    const positions = await getOPoppoPositions();
    for (const position of positions) {
      try {
        await prisma.oPoppoPosition.upsert({
          where: {
            yakusyokuCd_kaisyaCd: {
              yakusyokuCd: position.YAKUSYOKU_CD,
              kaisyaCd: position.KAISYA_CD
            }
          },
          update: { yakusyokuNm: position.YAKUSYOKU_NM },
          create: {
            yakusyokuCd: position.YAKUSYOKU_CD,
            kaisyaCd: position.KAISYA_CD,
            yakusyokuNm: position.YAKUSYOKU_NM
          }
        });
      } catch (error) {
        console.error(`Error upserting position ${position.YAKUSYOKU_CD}:`, error);
      }
    }
    
    // ステップ4: OPoppoユーザーデータを同期
    const users = await getOPoppoUsers();
    let count = 0;
    
    for (const user of users) {
      try {
        await prisma.oPoppoUser.upsert({
          where: { userId: user.USER_ID },
          update: {
            sei: user.SEI,
            mei: user.MEI,
            yakusyokuCd: user.YAKUSYOKU_CD,
            kaisyaCd: user.KAISYA_CD,
            soshikiCd: user.SOSHIKI_CD
          },
          create: {
            userId: user.USER_ID,
            sei: user.SEI,
            mei: user.MEI,
            yakusyokuCd: user.YAKUSYOKU_CD,
            kaisyaCd: user.KAISYA_CD,
            soshikiCd: user.SOSHIKI_CD
          }
        });
        count++;
      } catch (error) {
        console.error(`Error upserting user ${user.USER_ID}:`, error);
      }
    }
    
    // ログ記録
    await storage.createSyncLog({
      type: 'opoppo_db_sync',
      status: 'success',
      details: { 
        companies: companies.length,
        organizations: organizations.length,
        positions: positions.length,
        users: count
      }
    });
    
    return count;
  } catch (error: any) {
    console.error('Error synchronizing Opoppo data to internal DB:', error);
    
    await storage.createSyncLog({
      type: 'opoppo_db_sync',
      status: 'error',
      details: { error: error.message || 'Unknown error' }
    });
    
    throw error;
  }
}

/**
 * 内部DBのOPoppoデータからGrafanaユーザーを同期・更新する
 */
export async function syncOPoppoUsersToGrafana(): Promise<number> {
  try {
    // まず内部DBを最新のOPoppoデータで更新
    await syncOPoppoDB();
    
    // 内部DB上のOPoppoユーザーデータを読み込む
    const opoppoUsers = await prisma.oPoppoUser.findMany({
      include: {
        company: true,
        organization: true,
        position: true
      }
    });
    
    let count = 0;
    
    for (const opoppoUser of opoppoUsers) {
      // 名前が無い場合はIDを使用
      const name = opoppoUser.sei || opoppoUser.mei 
        ? `${opoppoUser.sei || ''} ${opoppoUser.mei || ''}`.trim()
        : opoppoUser.userId;
      const email = `${opoppoUser.userId}@example.com`; // Create a default email if not available
      
      // Check if user already exists in our Grafana database
      const existingUser = await storage.getGrafanaUserByUserId(opoppoUser.userId);
      
      if (existingUser) {
        // Update existing user
        await storage.updateGrafanaUser(existingUser.id, {
          name,
          department: opoppoUser.organization?.soshikiNm || null,
          position: opoppoUser.position?.yakusyokuNm || null,
          company: opoppoUser.company?.kaisyaNm || null,
        });
      } else {
        // Create new user
        const newUser = await prisma.grafanaUser.create({
          data: {
            userId: opoppoUser.userId,
            name: name || null,
            email: email || null,
            login: opoppoUser.userId,
            department: opoppoUser.organization?.soshikiNm || null,
            position: opoppoUser.position?.yakusyokuNm || null,
            company: opoppoUser.company?.kaisyaNm || null,
            grafanaId: null,
            lastLogin: null,
            status: 'pending',
          }
        });
        count++;
      }
    }
    
    // Log successful sync
    await storage.createSyncLog({
      type: 'opoppo_to_grafana',
      status: 'success',
      details: { added: count, total: opoppoUsers.length }
    });
    
    return count;
  } catch (error: any) {
    console.error('Error synchronizing Opoppo users to Grafana:', error);
    
    // Log error
    await storage.createSyncLog({
      type: 'opoppo_to_grafana',
      status: 'error',
      details: { error: error.message || 'Unknown error' }
    });
    
    throw error;
  }
}
