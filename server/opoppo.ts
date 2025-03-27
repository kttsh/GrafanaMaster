import pkg from 'pg';
const { Pool } = pkg;
import { storage } from './storage';
import { InsertGrafanaUser } from '@shared/schema';

// Connect to Opoppo database
const opoppoDb = new Pool({
  host: process.env.OPOPPO_DB_HOST || 'muska01',
  database: process.env.OPOPPO_DB_NAME || 'OPO_C',
  user: process.env.OPOPPO_DB_USER,
  password: process.env.OPOPPO_DB_PASSWORD,
  port: parseInt(process.env.OPOPPO_DB_PORT || '5432'),
  ssl: process.env.OPOPPO_DB_SSL === 'true'
});

// Interface for Opoppo user data
interface OPoppoUser {
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
    
    const result = await opoppoDb.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching Opoppo users:', error);
    return [];
  }
}

export async function getOPoppoUserById(userId: string): Promise<OPoppoUser | null> {
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
  try {
    const query = 'SELECT KAISYA_CD, KAISYA_NM FROM KAISYA ORDER BY KAISYA_NM';
    const result = await opoppoDb.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching Opoppo companies:', error);
    return [];
  }
}

export async function getOPoppoOrganizations(): Promise<{ KAISYA_CD: string, SOSHIKI_CD: string, SOSHIKI_NM: string }[]> {
  try {
    const query = 'SELECT KAISYA_CD, SOSHIKI_CD, SOSHIKI_NM FROM SOSHIKI ORDER BY KAISYA_CD, SOSHIKI_NM';
    const result = await opoppoDb.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching Opoppo organizations:', error);
    return [];
  }
}

export async function getOPoppoPositions(): Promise<{ KAISYA_CD: string, YAKUSYOKU_CD: string, YAKUSYOKU_NM: string }[]> {
  try {
    const query = 'SELECT KAISYA_CD, YAKUSYOKU_CD, YAKUSYOKU_NM FROM YAKUSYOKU ORDER BY KAISYA_CD, YAKUSYOKU_NM';
    const result = await opoppoDb.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching Opoppo positions:', error);
    return [];
  }
}

export async function syncOPoppoUsersToGrafana(): Promise<number> {
  try {
    const opoppoUsers = await getOPoppoUsers();
    let count = 0;
    
    for (const opoppoUser of opoppoUsers) {
      const name = `${opoppoUser.SEI} ${opoppoUser.MEI}`.trim();
      const email = `${opoppoUser.USER_ID}@example.com`; // Create a default email if not available
      
      // Check if user already exists in our database
      const existingUser = await storage.getGrafanaUserByUserId(opoppoUser.USER_ID);
      
      if (existingUser) {
        // Update existing user
        await storage.updateGrafanaUser(existingUser.id, {
          name,
          department: opoppoUser.SOSHIKI_NM,
          position: opoppoUser.YAKUSYOKU_NM,
          company: opoppoUser.KAISYA_NM,
        });
      } else {
        // Create new user
        const newUser: InsertGrafanaUser = {
          userId: opoppoUser.USER_ID,
          name,
          email,
          login: opoppoUser.USER_ID, // Use USER_ID as login name
          department: opoppoUser.SOSHIKI_NM,
          position: opoppoUser.YAKUSYOKU_NM,
          company: opoppoUser.KAISYA_NM,
          status: 'pending',
        };
        
        await storage.createGrafanaUser(newUser);
        count++;
      }
    }
    
    // Log successful sync
    await storage.createSyncLog({
      type: 'opoppo_to_db',
      status: 'success',
      details: { added: count, total: opoppoUsers.length }
    });
    
    return count;
  } catch (error) {
    console.error('Error synchronizing Opoppo users:', error);
    
    // Log error
    await storage.createSyncLog({
      type: 'opoppo_to_db',
      status: 'error',
      details: { error: error.message }
    });
    
    throw error;
  }
}
