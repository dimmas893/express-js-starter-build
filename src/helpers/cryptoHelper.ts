import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const generateKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
};

const hashSecret = async (secret: string) => {
  return await bcrypt.hash(secret, 10);
};

const compareSecret = async (secret: string, hashedSecret: string) => {
  return await bcrypt.compare(secret, hashedSecret);
};

const saveKeyToFile = async (key: string, filepath: string) => {
  const dir = path.dirname(filepath);
  await mkdir(dir, { recursive: true });
  await writeFile(filepath, key, 'utf-8');
};

const readKeyFromFile = async (filepath: string) => {
  return await readFile(filepath, 'utf-8');
};

const validateSecret = async (apiKey: string, secret: string, privateKey: string): Promise<boolean> => {
  const secretKeyPath = path.join('logs', 'credentials', apiKey, 'secret.key');
  const privateKeyPath = path.join('logs', 'credentials', apiKey, 'private.key');

  try {
    const storedSecret = await readFile(secretKeyPath, 'utf-8');
    const storedPrivateKey = await readFile(privateKeyPath, 'utf-8');

    console.log("Stored Secret:", storedSecret);
    console.log("Stored Private Key:", storedPrivateKey);
    console.log("Provided Secret:", secret);
    console.log("Provided Private Key:", privateKey);

    if (storedSecret === secret && storedPrivateKey === privateKey) {
      console.log("Secrets and private key are directly equal, skipping bcrypt comparison.");
      return true;
    }

    const isMatch = await bcrypt.compare(secret, storedSecret);
    return isMatch && storedPrivateKey === privateKey;
  } catch (error) {
    console.error('Error reading or comparing keys:', error);
    return false;
  }
};

export { generateKeyPair, hashSecret, compareSecret, saveKeyToFile, readKeyFromFile, validateSecret };
