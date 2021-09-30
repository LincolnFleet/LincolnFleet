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
	let readme = (
		await fs.readFile(path.join(process.cwd(), './README.template.md'))
	).toString('utf-8');

	for (const fieldData of dynamicFields) {
		const { fieldName, uri, reqDataPath } = fieldData
		const req = await ( await fetch(uri) ).json()

		if (req.status === 200) {
			let reqData = req
			reqDataPath.forEach((key) => reqData = reqData[key])
			readme = readme.replace(`{{${fieldName}}}`, reqData)
		}
	}

	await fs.writeFile('README.md', readme)
}

main();