const { JSDOM } = require("jsdom"); // v16.4.0
const fetch = require("node-fetch");  // v2.6.1

let generatorName = "animal-sentence"; // <-- change this to your generator name
let html = await fetch(`https://perchance.org/api/downloadGenerator?generatorName=${generatorName}&__cacheBust=${Math.random()}`).then(r => r.text());
const { window } = new JSDOM(html, {runScripts: "dangerously"});

// now you can use the `window` object of your generator like this:
console.log(window.root.output.toString());
console.log(window.root.yourListName.toString());
window.root.character.hitpoints = 10;
let charDesc = window.root.character.description.evaluateItem;
window.update();