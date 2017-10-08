import DatabaseService from "./DatabaseService";
import { getAuth } from "./AuthUtilities";
import Utilities from "./Utilities";

export default async function GetDocAction(action) {
	const auth = await getAuth(action.viewerUser, action.viewerSession);
	if (!auth) {
		throw "User is not authenticated";
	}

	const getDoc = async () =>
		await DatabaseService.getDoc(
			action.user + "-" + action.project + "-" + action.id
		);

	if (action.viewerUser === action.user) {
		return getDoc();
	}

	const userDoc = await DatabaseService.getDoc(action.user);
	const proj =
		userDoc && userDoc.projects && userDoc.projects[action.project];
	if (proj && proj.isPublic) {
		return getDoc();
	}
	throw "Invalid project";
}
