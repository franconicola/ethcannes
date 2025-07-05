import {
    getPrompt as get,
    getStorageStatus as getStatus,
    getTestPrompt as getTest,
    storePrompt as store,
    validatePrompt as validate,
    verifyPrompt as verify,
} from '../services/zgStorageService.js';
import { jsonWithCors } from '../utils/cors.js';

export async function getStorageStatus(request, env, authInfo, anonymousSession, prisma) {
  const result = await getStatus();
  return jsonWithCors(result);
}

export async function storePrompt(request, env, authInfo, anonymousSession, prisma) {
  const body = await request.json();
  const result = await store(body);
  return jsonWithCors(result);
}

export async function getPrompt(request, env, authInfo, anonymousSession, prisma) {
  const { rootHash } = request.params;
  const result = await get(rootHash);
  return jsonWithCors(result);
}

export async function verifyPrompt(request, env, authInfo, anonymousSession, prisma) {
    const body = await request.json();
    const result = await verify(body);
    return jsonWithCors(result);
}
    
export async function validatePrompt(request, env, authInfo, anonymousSession, prisma) {
    const body = await request.json();
    const result = await validate(body);
    return jsonWithCors(result);
}

export async function getTestPrompt(request, env, authInfo, anonymousSession, prisma) {
    const { agentId } = request.params;
    const result = await getTest(agentId);
    return jsonWithCors(result);
} 