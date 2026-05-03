"use server";

import { cookies } from "next/headers";
import { Account, Client, TablesDB } from "node-appwrite";
import { APPWRITE_SESSION_COOKIE } from "./auth-constants";
import {
  getAppwriteClientConfig,
  getAppwriteServerApiKey,
} from "./appwrite-env";

export async function createSessionClient() {
  const { endpoint, projectId } = getAppwriteClientConfig();
  const client = new Client().setEndpoint(endpoint).setProject(projectId);

  const session = (await cookies()).get(APPWRITE_SESSION_COOKIE);
  if (!session || !session.value) {
    throw new Error("No session");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get tablesDB() {
      return new TablesDB(client);
    },
  };
}

export async function createAdminClient() {
  const { endpoint, projectId } = getAppwriteClientConfig();
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(getAppwriteServerApiKey());

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch (error) {
    return null;
  }
}
