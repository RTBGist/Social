import { ID } from 'appwrite';

import {INewUser} from "@/types";
import {account, appwriteConfig, avatars, databases} from "./config";

export async function createUserAccount(user: INewUser) {
	try {

		// create newUser
		const newAccount = await account.create(
				ID.unique(),
				user.email,
				user.password,
				user.name
		)
		if(!newAccount) throw Error;

		// save newUser to DB
		const avatarUrl = avatars.getInitials();
		const newUser = await saveUserToDB({
			accountId: newAccount.$id,
			name: newAccount.name,
			email: newAccount.email,
			username: user.username,
			imageUrl: avatarUrl
		});
	} catch (error) {
		console.log(error);
		return error
	}
}

export async function saveUserToDB(user: {
		accountId: string,
		email: string,
		name: string,
		imageUrl: URL,
		username?: string,
	}) {
	try {
		const newUser = await databases.createDocument(
				appwriteConfig.databaseId,
				appwriteConfig.userCollectionId,
				ID.unique(),
				user,
		)

		return newUser;
	} catch (e) {
		console.log(e);
	}
}

export async function signInAccount(user: {email: string, password: string}) {
	try {
		const session = await account.createEmailSession(user.email, user.password)

		return session;
	} catch (e) {
		console.log(e);
	}
}