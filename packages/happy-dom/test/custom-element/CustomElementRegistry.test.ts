import CustomElement from '../CustomElement.js';
import CustomElementRegistry from '../../src/custom-element/CustomElementRegistry.js';
import IWindow from '../../src/window/IWindow.js';
import IDocument from '../../src/nodes/document/IDocument.js';
import Window from '../../src/window/Window.js';
import { beforeEach, describe, it, expect } from 'vitest';
import { rejects } from 'assert';

describe('CustomElementRegistry', () => {
	let customElements;
	let window: IWindow;
	let document: IDocument;

	beforeEach(() => {
		window = new Window();
		document = window.document;
		customElements = new CustomElementRegistry();
		CustomElement.observedAttributesCallCount = 0;
	});

	describe('isValidCustomElementName()', () => {
		it('Validate custom elements tag name.', () => {
			expect(customElements.isValidCustomElementName('a-b')).toBe(true);
			expect(customElements.isValidCustomElementName('2a-b')).toBe(false);
			expect(customElements.isValidCustomElementName('a2-b')).toBe(true);
			expect(customElements.isValidCustomElementName('A-B')).toBe(false);
			expect(customElements.isValidCustomElementName('aB-c')).toBe(false);
			expect(customElements.isValidCustomElementName('ab')).toBe(false);
			expect(customElements.isValidCustomElementName('a-\u00d9')).toBe(true);
			expect(customElements.isValidCustomElementName('a_b.c-d')).toBe(true);
			expect(customElements.isValidCustomElementName('font-face')).toBe(false);
			expect(customElements.isValidCustomElementName('a-Öa')).toBe(true);
		});
	});

	describe('define()', () => {
		it('Defines an HTML element and returns it with get().', () => {
			customElements.define('custom-element', CustomElement);
			expect(customElements.get('custom-element')).toBe(CustomElement);
		});

		it('Defines an HTML element and sets the "extends" option to "ul".', () => {
			customElements.define('custom-element', CustomElement, {
				extends: 'ul'
			});
			expect(customElements.get('custom-element')).toBe(CustomElement);
			expect(customElements._registry['custom-element'].extends).toBe('ul');
		});

		it('Throws an error if tag name does not contain "-".', () => {
			const tagName = 'element';
			expect(() => customElements.define(tagName, CustomElement)).toThrow(
				new Error(
					"Failed to execute 'define' on 'CustomElementRegistry': \"" +
						tagName +
						'" is not a valid custom element name.'
				)
			);
		});

		it('Throws an error if already defined.', () => {
			customElements.define('custom-element', CustomElement);
			expect(() => customElements.define('custom-element', CustomElement)).toThrow();
		});

		it('Throws an error if already registered under a different tag name.', () => {
			customElements.define('custom-element', CustomElement);
			expect(() => customElements.define('custom-element2', CustomElement)).toThrow();
		});

		it('Calls observed attributes and set _observedAttributes as a property on the element class.', () => {
			customElements.define('custom-element', CustomElement);
			expect(CustomElement.observedAttributesCallCount).toBe(1);
			expect(CustomElement._observedAttributes).toEqual(['key1', 'key2']);
		});

		it('Non-ASCII capital letter in localName.', () => {
			customElements.define('a-Öa', CustomElement);
			expect(customElements.get('a-Öa')).toBe(CustomElement);
		});
	});

	describe('get()', () => {
		it('Returns element class if the tag name has been defined.', () => {
			customElements.define('custom-element', CustomElement);
			expect(customElements.get('custom-element')).toBe(CustomElement);
		});

		it('Returns undefined if the tag name has not been defined.', () => {
			expect(customElements.get('custom-element')).toBe(undefined);
		});

		it('Case sensitivity of get().', () => {
			customElements.define('custom-element', CustomElement);
			expect(customElements.get('CUSTOM-ELEMENT')).toBe(undefined);
		});
	});

	describe('whenDefined()', () => {
		it('Throws an error if tag name looks invalid.', async () => {
			const tagName = 'element';
			expect(async () => await customElements.whenDefined(tagName)).rejects.toThrow();
		});

		it('Returns a promise which is fulfilled when an element is defined.', async () => {
			await new Promise((resolve) => {
				customElements.whenDefined('custom-element').then(resolve);
				customElements.define('custom-element', CustomElement);
			});
		});

		it('Resolves directly if the element is already defined.', async () => {
			await new Promise((resolve) => {
				customElements.define('custom-element', CustomElement);
				customElements.whenDefined('custom-element').then(resolve);
			});
		});
	});

	describe('getName()', () => {
		it('Returns null if no tagName is found in the registry for element class', () => {
			expect(customElements.getName(CustomElement)).toBe(null);
		});

		it('Returns Tag name if element class is found in registry', () => {
			customElements.define('custom-element', CustomElement);
			expect(customElements.getName(CustomElement)).toMatch('custom-element');
		});
	});

	describe('createElement()', () => {
		it('Case insensitive access via document.createElement().', () => {
			customElements.define('custom-element', CustomElement);
			expect(document.createElement('CUSTOM-ELEMENT').localName).toBe('custom-element');
		});

		it('Non-ASCII capital letters in document.createElement().', () => {
			customElements.define('a-Öa', CustomElement);
			expect(document.createElement('a-Öa').localName).toMatch(/a-Öa/i);
		});
	});
});
