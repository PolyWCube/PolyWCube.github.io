let identifiers = {};
let relations = [];

const DATA_BASE_PATH = "/src/base/txt/database";

export async function LOAD_identifier(identifierName) {
	try {
		const identifierPath = `${DATA_BASE_PATH}/identifier/${identifierName}.txt`;
		console.log(`LOAD Identifier "${identifierName}" at "${identifierPath}"`);

		const response = await fetch(identifierPath);
		if (!response.ok) {
			console.error(`ERROR loading database ${identifierName} - HTTP ${response.status}`);
			return null;
		}
		const identifier = await response.text();
		const properties = identifier.split(/\n\s*\n/);
		const data = { name: identifierName };

		properties.forEach(property => {
			const colonIndex = property.indexOf(':');
			if (colonIndex !== -1) {
				const key = property.substring(0, colonIndex).trim();
				const value = property.substring(colonIndex + 1).trim();
				data[key] = value;
			} else {
				console.error(`ERROR identifier ${identifierName} - DATABASE Syntax Error`);
			}
		});

		console.log(`LOAD Identifier successful`);
		console.log(data);

		return data;
	} catch (error) {
		console.error(`ERROR loading identifier ${identifierName} - HTTP `, error);
		return null;
	}
}