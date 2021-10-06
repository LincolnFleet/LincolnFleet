// require('isomorphic-unfetch');
const { promises: fs } = require('fs');
const path = require('path');

const dynamicFields = [
	{
		fieldName: "",
		uri: "",
		reqDataPath: [],
	},
]

async function main() {
	// Read the template file contents into a string, async for safety.
	let readme = (
		await fs.readFile(path.join(process.cwd(), './README.template.md'))
	).toString('utf-8');

	// Replace the template fields with the actual data, if available.
	for (const fieldData of dynamicFields) {
		const { fieldName, uri, reqDataPath } = fieldData
		const req = await ( await fetch(uri) ).json()

		if (req.status == 200) {
			let reqData = req
			reqDataPath.forEach((key) => reqData = reqData[key])
			readme = readme.replace(`{{${fieldName}}}`, reqData)
		}
	}
	{/*
		Write the contents of the template file to the README.md file.
		This may seem like an extra step, but it's necessary to ensure there are no collisions between the existing contents of the README.md file and the new contents.
		Since this action is happening in an automated workflow we will not have the chance to manually resolve conflicts.
	*/}
	await fs.writeFile('README.md', readme)
}

main();