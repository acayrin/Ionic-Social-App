import { Database } from "./database.js";

const Db = new Database().database("IonicSocial")!!;

(async () => {
	if (!(await Db?.collection("Users").indexExists("_id"))) {
		await Db?.collection("Users").createIndex({ _id: "text" });
	}
})();

export { Db };
