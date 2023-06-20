import { Attachment, RequestAttachment } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";
import { PickedFile } from "@capawesome/capacitor-file-picker";

const Col = Db.collection<Attachment>("Attachments");

const handler: RequestHandler<{
	files: PickedFile[];
}> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	const formData = new FormData();
	formData.append(
		"payload_json",
		JSON.stringify({
			content: [Date.now(), user, d!.files.length].join(" "),
		})
	);
	for (let i = 0; i < d!.files.length; i++) {
		const file = d!.files[i];
		const { buffer, filename, type } = await urlToFile(`data:${file.mimeType};base64,${file.data}`, file.name);

		formData.append(`files${i}`, new Blob([buffer], { type }), filename);
	}

	const discordRequest: {
		attachments: RequestAttachment[];
	} = await (
		await fetch(process.env.DISCORD_WEBHOOK as string, {
			method: "POST",
			body: formData,
			redirect: "follow",
		})
	).json();
	const attachments = discordRequest.attachments.map((attachment) => ({
		filename: attachment.filename,
		ownerId: user,
		timestamp: Date.now(),
		url: attachment.url,
		size: attachment.size,
		proxy_url: attachment.proxy_url,
	}));

	// prettier-ignore
	return (await Col.insertMany(attachments)).insertedCount > 0 ? {
			status: "ok",
			attachments,
		} : {
			status: "not ok",
			error: "Failed to upload file",
		};
};

const urlToFile = async (url: string, filename: string, mimeType?: string) => {
	mimeType = mimeType ?? (url.match(/^data:([^;]+);/) ?? "")[1];
	const res = await fetch(url);
	const buf = await res.arrayBuffer();
	return {
		buffer: buf,
		filename,
		type: mimeType,
	};
};

export { handler as attachmentCreateHandler };
