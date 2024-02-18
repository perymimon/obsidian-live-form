import {App, setTooltip, TFile} from "obsidian";
import {MyPluginSettings} from "./settings";
import {executeCode, importJs} from "./api";
import * as api from "./api"
import {refresh, replaceAndSave} from "./internalApi";

export const BUTTON_PATTERN = /button(?<name>\[[^\]]+])\s*(?<literal>=)?\s*(?<path>.+?)?\s+(?<id>-\d+-)/i
export const BUTTON_PATTERN_TEXT = new RegExp(`\`${BUTTON_PATTERN.source}?\``, 'ig')

// https://regex101.com/r/AN0SOC/1
export function replaceCode2Buttons(root: HTMLElement, ctx, settings: MyPluginSettings, app: App) {
	const codesEl = root.findAll('code')
	for (let codeEl of codesEl) {
		const text = codeEl.innerText.trim()
		const buttonNotation = text.match(BUTTON_PATTERN)
		if (!buttonNotation) continue;
		const fields = buttonNotation.groups;
		fields!.pattern = '`' + text + '`'
		createButton(codeEl, app, ctx.frontmatter, fields)
	}
}

function createButton(rootEl, app: App, frontmatter, fields) {
	const buttonEl = rootEl.createEl('button', {cls: 'live-form'})
	const {name, path, literal, pattern} = fields
	buttonEl.textContent = name
	rootEl.replaceWith(buttonEl)
	buttonEl.addEventListener('click', async (event) => {
		global.live = api
		if (literal) {
			let ret = await executeCode(path)
			 await replaceAndSave(pattern, ret)
			return
		}
		const instrunction = await importJs(path)
		delete global.live
	})
}
