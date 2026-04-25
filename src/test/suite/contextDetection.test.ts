import * as assert from 'assert';
import { detectContext } from '../../uxmlProviders';
import { detectUssContext } from '../../ussProviders';

suite('UXML context detection', () => {
    test('inside element name (with namespace)', () => {
        const ctx = detectContext('<engine:But');
        assert.strictEqual(ctx.kind, 'tag');
        if (ctx.kind === 'tag') {
            assert.strictEqual(ctx.namespacePrefix, 'engine');
        }
    });

    test('inside element name (no namespace)', () => {
        const ctx = detectContext('<Butt');
        assert.strictEqual(ctx.kind, 'tag');
        if (ctx.kind === 'tag') {
            assert.strictEqual(ctx.namespacePrefix, '');
        }
    });

    test('after element name, ready for attribute', () => {
        const ctx = detectContext('<engine:Button ');
        assert.strictEqual(ctx.kind, 'attributeName');
        if (ctx.kind === 'attributeName') {
            assert.strictEqual(ctx.tagName, 'Button');
        }
    });

    test('inside attribute value (double quotes)', () => {
        const ctx = detectContext('<engine:Toggle value="');
        assert.strictEqual(ctx.kind, 'attributeValue');
        if (ctx.kind === 'attributeValue') {
            assert.strictEqual(ctx.tagName, 'Toggle');
            assert.strictEqual(ctx.attributeName, 'value');
        }
    });

    test('inside attribute value (single quotes)', () => {
        const ctx = detectContext("<engine:Toggle value='");
        assert.strictEqual(ctx.kind, 'attributeValue');
        if (ctx.kind === 'attributeValue') {
            assert.strictEqual(ctx.attributeName, 'value');
        }
    });

    test('after closed tag is text', () => {
        const ctx = detectContext('<engine:Button text="OK" />');
        assert.strictEqual(ctx.kind, 'text');
    });

    test('does not get confused by previously closed attributes', () => {
        const ctx = detectContext('<engine:Toggle name="boots" value="');
        assert.strictEqual(ctx.kind, 'attributeValue');
        if (ctx.kind === 'attributeValue') {
            assert.strictEqual(ctx.attributeName, 'value');
        }
    });

    test('XML declaration is treated as text-context-after', () => {
        const ctx = detectContext('<?xml version="1.0"?>\n<engine:UXML');
        assert.strictEqual(ctx.kind, 'tag');
    });
});

suite('USS context detection', () => {
    test('outside any rule block is selector context', () => {
        const ctx = detectUssContext('.button { color: red; }\n#root');
        assert.strictEqual(ctx.kind, 'selector');
    });

    test('inside a rule block, before any colon, is property name', () => {
        const ctx = detectUssContext('.button {\n    bord');
        assert.strictEqual(ctx.kind, 'propertyName');
    });

    test('inside a rule block, after a colon, is property value', () => {
        const ctx = detectUssContext('.button {\n    flex-direction: ');
        assert.strictEqual(ctx.kind, 'propertyValue');
        if (ctx.kind === 'propertyValue') {
            assert.strictEqual(ctx.propertyName, 'flex-direction');
        }
    });

    test('after a semicolon, we are back in property name context', () => {
        const ctx = detectUssContext('.button {\n    color: red;\n    backgr');
        assert.strictEqual(ctx.kind, 'propertyName');
    });

    test('after the closing brace, back to selector', () => {
        const ctx = detectUssContext('.button { color: red; }\n.foo');
        assert.strictEqual(ctx.kind, 'selector');
    });

    test('comments do not break context detection', () => {
        const ctx = detectUssContext('.button {\n    /* color: red; here is some stuff */\n    flex-direction: ');
        assert.strictEqual(ctx.kind, 'propertyValue');
        if (ctx.kind === 'propertyValue') {
            assert.strictEqual(ctx.propertyName, 'flex-direction');
        }
    });

    test('Unity-prefixed property is detected', () => {
        const ctx = detectUssContext('.button {\n    -unity-text-align: ');
        assert.strictEqual(ctx.kind, 'propertyValue');
        if (ctx.kind === 'propertyValue') {
            assert.strictEqual(ctx.propertyName, '-unity-text-align');
        }
    });
});
