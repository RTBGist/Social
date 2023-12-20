import {ID, Query} from 'appwrite';

import {INewPost, INewUser} from "@/types";
import {account, appwriteConfig, avatars, databases, storage} from "./config";

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

export async function getCurrentUser() {
	try {
		const currentAccount = await account.get()

		if(!currentAccount) throw Error;

		const currentUser = await databases.listDocuments(
				appwriteConfig.databaseId,
				appwriteConfig.userCollectionId,
				[Query.equal('accountId', currentAccount.$id)]
		)

		if(!currentAccount) throw Error;

		return currentUser.documents[0];
	} catch (e) {
		console.log(e);
	}
}

export async function signOutAccount() {
	try {
		const session = await account.deleteSession("current");

		return session;
	} catch (e) {
		console.log(e);
	}
}

export async function createPost(post: INewPost) {
	try {
		// Upload image to storage
		const uploadedFile = await uploadFile(post.file[0])

		if(!uploadedFile) throw Error;

		// Get file url
		const fileUrl = getFilePreview(uploadedFile.$id);

		if(!fileUrl) {
			await deleteFile(uploadedFile.$id);
			throw Error;
		}

		// Convert tags in an array
		const tags = post.tags?.replace(/ /g,'').split(',') || [];

		// Save post to db
		const newPost = await databases.createDocument(
				appwriteConfig.databaseId,
				appwriteConfig.postCollectionId,
				ID.unique(),
				{
					creator: post.userId,
					caption: post.caption,
					imageUrl: fileUrl,
					imageId: uploadedFile.$id,
					location: post.location,
					tags: tags,
				}
		)

		if(!newPost) {
			await deleteFile(uploadedFile.$id)
			throw Error;
		}

		return newPost;
	} catch (e) {
		console.log(e);
	}
}

export async function uploadFile(file: File) {
	try {
		const uploadedFile = await storage.createFile(
				appwriteConfig.storageId,
				ID.unique(),
				file,
		);

		return uploadedFile;
	} catch (e) {
		console.log(e);
	}
}

export function getFilePreview(fileId: string) {
	try {
		const fileUrl = storage.getFilePreview(
				appwriteConfig.storageId,
				fileId,
				2000,
				2000,
				"top",
				100
		)

		return fileUrl
	} catch (e) {
		console.log(e);
	}
}

export async function deleteFile(fileId: string) {
	try {
		await storage.deleteFile(appwriteConfig.storageId, fileId)

		return { status: 'ok' }
	} catch (e) {
		console.log(e);
	}
}

export async function getRecentPosts() {
	const posts = await databases.listDocuments(
			appwriteConfig.databaseId,
			appwriteConfig.postCollectionId,
			[Query.orderDesc('$createdAt'), Query.limit(20)]
	)

	if(!posts) throw Error;

	return posts;
}