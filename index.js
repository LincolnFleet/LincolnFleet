// require('isomorphic-unfetch');
const { promises: fs } = require('fs');
const path = require('path');

/** This file is a script which will fetch and inject dynamic content into the README.template.md file before overwriting the contents of README.md with the resulting static content in the template. This is a necessary step to ensure there are no collisions between the existing contents of the README.md file and the new contents. Since this action is happening in an automated workflow we will not have the chance to manually resolve conflicts.
 * Dynamic fields in the template are indicated by the following pattern: {{field_name}}
 */

const dynamicFields = [
	{
		name: "example",  // Example of object structure. Unused in code
		source: "",
		uri: "",
		dataPath: [],
		getData: () => "",
	}, {
		name: "updated_at",
		source: "local",
		getData: () => {
			return new Date().toUTCString()
		}
	}
];

async function main() {
	// Read the template file contents into a string, async for safety.
	let readme = (
		await fs.readFile(path.join(process.cwd(), './README.template.md'))
	).toString('utf-8')
	// Guard against empty template.
	if (!readme) { return "## [Automated content injection failed! Uh oh, I broke something...]" }

	// Replace each arbitrary field pattern in template string with the actual data, if available.
	for (const field of dynamicFields) {
		const { name, source, uri, dataPath, getData } = field;
		// Guard against empty required fields. Not entirely necessary but... whatevs.
		if (!name || !source) { continue }

		switch (source) {
			case "local":
				// Data is available locally via a function, variable, or the filesystem.

				const localData = getData()
				readme = readme.replace(`{{${name}}}`, localData.toString())
				break;

			case "fetch":
				// Data is available via a fetch request.

				const req = await (await fetch(uri)).json()
				// Guard against broken links.
				if (req.status != 200) { return `[Fetch failed for "${name}"]` }
				let fetchData = req
				// Follow the dataPath to get target data.
				dataPath.forEach((pathPart) => fetchData = fetchData[pathPart])
				// Replace arbitrary field name pattern with target data.
				readme = readme.replace(`{{${name}}}`, fetchData.toString())
				break;

			default:
				break;
		}
	}

	// Overwrite README.md with the updated contents of README.template.md.
	await fs.writeFile('README.md', readme)
}

main();